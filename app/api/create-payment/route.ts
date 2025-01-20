// @/app/api/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/backend/lib/stripe';
import mongodbConnect from '@/backend/lib/mongodb';
import { PaymentModel } from '@/backend/models/Payment';

export async function POST(req: NextRequest) {
  try {
    const { amount, studentId, month, year } = await req.json();

    await mongodbConnect();

    // Create Stripe checkout session with more payment methods
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'promptpay'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: `Monthly Fee - ${month} ${year}`,
              description: `Student ID: ${studentId}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        studentId,
        month,
        year,
      },
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
    });

    // Create payment record
    await PaymentModel.create({
      studentId,
      month,
      year,
      amount,
      sessionId: session.id,
      status: 'pending',
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Payment creation failed' },
      { status: 500 }
    );
  }
}