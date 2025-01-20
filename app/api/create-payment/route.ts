// @/app/api/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/backend/lib/stripe';
import mongodbConnect from '@/backend/lib/mongodb';
import { PaymentModel } from '@/backend/models/Payment';
import { PAYMENT_CONFIGS } from '@/backend/lib/constants';

interface PaymentRequest {
  amount: number;
  studentId: string;
  month: string;
  year: string;
  paymentMethod: 'card' | 'promptpay' | 'bank_transfer' | 'truemoney' | 'rabbit_linepay';
}

export async function POST(req: NextRequest) {
  try {
    await mongodbConnect();
    const paymentData: PaymentRequest = await req.json();
    const { amount, studentId, month, year, paymentMethod } = paymentData;

    // Create base payment record
    const basePaymentData = {
      studentId,
      month,
      year,
      amount,
      paymentMethod,
      currency: PAYMENT_CONFIGS.CURRENCY,
    };

    // Handle different payment methods
    if (paymentMethod === 'card' || paymentMethod === 'promptpay') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: [paymentMethod],
        line_items: [{
          price_data: {
            currency: PAYMENT_CONFIGS.CURRENCY,
            product_data: {
              name: `Monthly Fee - ${month} ${year}`,
              description: `Student ID: ${studentId}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        metadata: { studentId, month, year },
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
      });

      await PaymentModel.create({
        ...basePaymentData,
        sessionId: session.id,
        status: 'pending',
      });

      return NextResponse.json({ sessionId: session.id });
    }

    // Handle alternative payment methods
    const reference = `PAY${Date.now()}${Math.random().toString(36).slice(2, 5)}`;
    const payment = await PaymentModel.create({
      ...basePaymentData,
      reference,
      status: paymentMethod === 'bank_transfer' ? 'awaiting_verification' : 'pending',
    });

    const responseData = {
      paymentId: payment._id,
      reference,
      ...(paymentMethod === 'bank_transfer' && {
        bankDetails: {
          bankName: process.env.BANK_NAME,
          accountNumber: process.env.BANK_ACCOUNT_NUMBER,
          accountName: process.env.BANK_ACCOUNT_NAME,
        },
      }),
      redirectUrl: paymentMethod !== 'bank_transfer' 
        ? `/payment/${paymentMethod}/${payment._id}`
        : undefined,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}