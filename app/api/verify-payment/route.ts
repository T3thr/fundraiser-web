// @/app/api/verify-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/backend/lib/stripe';
import { PaymentModel } from '@/backend/models/Payment';
import { GoogleSheetsService } from '@/backend/lib/googleSheets';
import mongodbConnect from '@/backend/lib/mongodb';

async function updateGoogleSheets(payment: any) {
  try {
    const sheetsService = new GoogleSheetsService();
    await sheetsService.updatePaymentStatus(
      payment.studentId,
      payment.month,
      payment.amount
    );
    return true;
  } catch (error) {
    console.error('Google Sheets update error:', error);
    // Don't throw the error - we want the payment to be marked as complete
    // even if Google Sheets update fails
    return false;
  }
}

async function verifyAndUpdatePayment(sessionId: string) {
  // Verify with Stripe first
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session || session.payment_status !== 'paid') {
    throw new Error('Invalid payment session');
  }

  // Update payment status in database
  const payment = await PaymentModel.findOneAndUpdate(
    { sessionId },
    {
      status: 'completed',
      paidAt: new Date(),
      transactionId: session.payment_intent,
      updatedAt: new Date()
    },
    { new: true }
  );

  if (!payment) {
    throw new Error('Payment record not found');
  }

  // Try to update Google Sheets, but don't block payment completion
  await updateGoogleSheets(payment);

  return payment;
}

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await mongodbConnect();

    // Check if payment exists
    const existingPayment = await PaymentModel.findOne({ sessionId });
    if (!existingPayment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // If payment is already completed, return success
    if (existingPayment.status === 'completed') {
      return NextResponse.json({ success: true, alreadyCompleted: true });
    }

    // Process the payment verification and updates
    const updatedPayment = await verifyAndUpdatePayment(sessionId);

    return NextResponse.json({ 
      success: true,
      payment: {
        id: updatedPayment._id,
        status: updatedPayment.status,
        amount: updatedPayment.amount,
        studentId: updatedPayment.studentId,
        month: updatedPayment.month,
        year: updatedPayment.year
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Payment verification failed',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}