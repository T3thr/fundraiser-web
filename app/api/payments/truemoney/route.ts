// @/app/api/payments/truemoney/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongodbConnect from '@/backend/lib/mongodb';
import { PaymentModel } from '@/backend/models/Payment';

export async function POST(req: NextRequest) {
  try {
    const { paymentId, phone } = await req.json();

    if (!paymentId || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await mongodbConnect();
    const payment = await PaymentModel.findById(paymentId);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // TrueMoney API integration
    const trueMoneyResponse = await processWithTrueMoney({
      amount: payment.amount,
      phone,
      reference: payment.reference,
    });

    // Update payment record with tracking details
    await PaymentModel.findByIdAndUpdate(paymentId, {
      status: 'processing',
      phoneNumber: phone,
      transactionId: trueMoneyResponse.transactionId,
      lastUpdated: new Date(),
      paymentDetails: {
        provider: 'truemoney',
        ...trueMoneyResponse
      }
    });

    return NextResponse.json({
      success: true,
      transactionId: trueMoneyResponse.transactionId,
      redirectUrl: `/payment/status/${paymentId}`
    });
  } catch (error) {
    console.error('TrueMoney payment error:', error);
    return NextResponse.json(
      { error: 'Failed to process TrueMoney payment' },
      { status: 500 }
    );
  }
}

async function processWithTrueMoney({
  amount,
  phone,
  reference
}: {
  amount: number;
  phone: string;
  reference: string;
}) {
  // Ensure these variables are used in some meaningful way
  console.log(`Processing payment with TrueMoney`);
  console.log(`Amount: ${amount}, Phone: ${phone}, Reference: ${reference}`);

  // Placeholder for TrueMoney API integration
  // In a real implementation, this would be an API call to TrueMoney
  return {
    transactionId: `TM${Date.now()}`, // Placeholder transaction ID
    status: 'processing', // Placeholder status
    timestamp: new Date().toISOString(), // Placeholder timestamp
    referenceId: reference // Placeholder reference ID
  };
}
