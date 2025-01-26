// app/api/cleanup-expired-payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/backend/lib/stripe';
import mongodbConnect from '@/backend/lib/mongodb';
import { PaymentModel } from '@/backend/models/Payment';
import { PAYMENT_CONFIGS } from '@/backend/lib/constants';

export async function POST(req: NextRequest) {
  try {
    await mongodbConnect();

    // Find expired pending payments
    const expiredPayments = await PaymentModel.find({
      status: 'pending',
      expiresAt: { $lt: new Date() }
    });

    for (const payment of expiredPayments) {
      // Cancel Stripe session if it exists
      if (payment.sessionId) {
        try {
          await stripe.checkout.sessions.expire(payment.sessionId);
        } catch (stripeError) {
          console.error(`Failed to expire Stripe session ${payment.sessionId}:`, stripeError);
        }
      }

      // Update payment status
      payment.status = 'expired';
      await payment.save();
    }

    return NextResponse.json({ 
      message: 'Expired payments processed', 
      count: expiredPayments.length 
    });
  } catch (error) {
    console.error('Payment cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to process expired payments' },
      { status: 500 }
    );
  }
}