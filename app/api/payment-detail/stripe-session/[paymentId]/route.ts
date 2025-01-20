// @/app/api/payment/stripe-session/[paymentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PaymentModel } from '@/backend/models/Payment';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export async function GET(
  request: NextRequest,
  context: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = context.params;
    
    // Fetch payment details from the database
    const payment = await PaymentModel.findById(paymentId);
    
    if (!payment || payment.paymentMethod !== 'bank_transfer') {
      return NextResponse.json({ error: 'Invalid payment details' }, { status: 400 });
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: 'Bank Transfer Payment',
            },
            unit_amount: payment.amount * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/payment/success/${paymentId}`,
      cancel_url: `${process.env.BASE_URL}/payment/cancel/${paymentId}`,
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json({ error: 'Failed to create Stripe session' }, { status: 500 });
  }
}
