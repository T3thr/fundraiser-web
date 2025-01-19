// @/app/api/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/backend/lib/stripe';
import mongodbConnect from '@/backend/lib/mongodb';
import { PaymentModel } from '@/backend/models/Payment';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { amount, studentId, month, year } = await req.json();
    await mongodbConnect();

    // Get the current theme from cookies
    const cookieStore = await cookies();
    const themeCookie = cookieStore.get('theme');
    const currentTheme = themeCookie?.value || 'light';

    // Create the base URL with theme parameter
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const successUrl = `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&theme=${currentTheme}`;
    const cancelUrl = `${baseUrl}/?theme=${currentTheme}`;

    // Create Stripe checkout session
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
        theme: currentTheme, // Store theme in metadata
      },
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
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

    return NextResponse.json({ 
      sessionId: session.id,
      theme: currentTheme 
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Payment creation failed' },
      { status: 500 }
    );
  }
}