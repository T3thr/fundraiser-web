import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/backend/lib/stripe';
import mongodbConnect from '@/backend/lib/mongodb';
import { PaymentModel } from '@/backend/models/Payment';
import { PAYMENT_CONFIGS } from '@/backend/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const { amount, studentId, month, year, paymentMethod } = await req.json();
    await mongodbConnect();

    let sessionData;
    let paymentRecord;

    switch (paymentMethod) {
      case 'card':
      case 'promptpay': {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: [paymentMethod === 'card' ? 'card' : 'promptpay'],
          line_items: [
            {
              price_data: {
                currency: PAYMENT_CONFIGS.CURRENCY,
                product_data: {
                  name: `Monthly Fee - ${month} ${year}`,
                  description: `Student ID: ${studentId}`,
                },
                unit_amount: amount * 100, // Amount in cents
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
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,  // Ensure the URL is correct
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`, // Ensure the cancel URL is correct
        });

        paymentRecord = await PaymentModel.create({
          studentId,
          month,
          year,
          amount,
          sessionId: session.id,
          status: 'pending',
          paymentMethod,
        });

        sessionData = { sessionId: session.id };
        break;
      }

      case 'bank_transfer': {
        const refNumber = `REF${Date.now()}${Math.random().toString(36).slice(2, 5)}`;
        
        paymentRecord = await PaymentModel.create({
          studentId,
          month,
          year,
          amount,
          status: 'awaiting_verification',
          paymentMethod,
          bankTransferRef: refNumber,
          reference: refNumber,
        });

        sessionData = { 
          paymentId: paymentRecord._id,
          bankDetails: {
            bankName: process.env.BANK_NAME,
            accountNumber: process.env.BANK_ACCOUNT_NUMBER,
            accountName: process.env.BANK_ACCOUNT_NAME,
            reference: refNumber,
          }
        };
        break;
      }

      case 'truemoney':
      case 'rabbit_linepay': {
        const reference = `PAY${Date.now()}${Math.random().toString(36).slice(2, 5)}`;
        
        paymentRecord = await PaymentModel.create({
          studentId,
          month,
          year,
          amount,
          status: 'pending',
          paymentMethod,
          reference,
        });

        sessionData = {
          paymentId: paymentRecord._id,
          reference,
          redirectUrl: `/payment/${paymentMethod}/${paymentRecord._id}`,  // Ensure the URL is correct
        };
        break;
      }

      default:
        throw new Error('Invalid payment method');
    }

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
