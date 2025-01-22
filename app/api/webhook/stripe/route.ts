import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/backend/lib/stripe';
import { PaymentModel } from '@/backend/models/Payment';
import { GoogleSheetsService } from '@/backend/lib/googleSheets';
import mongodbConnect from '@/backend/lib/mongodb';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function handleSuccessfulPayment(session: any) {
  const { studentId, month } = session.metadata;
  
  // Update payment record
  const payment = await PaymentModel.findOneAndUpdate(
    { sessionId: session.id },
    {
      status: 'completed',
      transactionId: session.payment_intent,
      paidAt: new Date(),
      updatedAt: new Date()
    },
    { new: true }
  );

  if (!payment) {
    throw new Error('Payment record not found');
  }

  // Update Google Sheets
  const sheetsService = new GoogleSheetsService();
  await sheetsService.updatePaymentStatus(
    studentId,
    month,
    payment.amount
  );

  return payment;
}

export async function POST(req: NextRequest) {
  try {
    await mongodbConnect();
    const body = await req.text();
    const headerList = await headers(); // Added await here
    const signature = headerList.get('stripe-signature');

    if (!signature) {
      return new NextResponse('Missing signature', { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new NextResponse('Invalid signature', { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleSuccessfulPayment(session);
        break;
      }
      // Handle other event types if needed
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Webhook handler failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};