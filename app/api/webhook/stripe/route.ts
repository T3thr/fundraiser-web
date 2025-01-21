// @/app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/backend/lib/stripe';
import { PaymentModel } from '@/backend/models/Payment';
import { GoogleSheetsService } from '@/backend/lib/googleSheets';
import mongodbConnect from '@/backend/lib/mongodb';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    await mongodbConnect();
    const body = await req.text();
    
    // Await the headers() function before accessing the signature
    const headerList = await headers();
    const signature = headerList.get('stripe-signature');

    if (!signature) {
      return new NextResponse('No signature found', { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new NextResponse('Webhook signature verification failed', { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      
      // Validate session metadata
      if (!session.metadata?.studentId || !session.metadata?.month || !session.metadata?.year) {
        throw new Error('Missing required metadata');
      }

      const { studentId, month } = session.metadata;

      // Update payment status in MongoDB
      const payment = await PaymentModel.findOneAndUpdate(
        { sessionId: session.id },
        { 
          status: 'completed',
          transactionId: session.payment_intent,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Initialize Google Sheets service and update
      const sheetsService = new GoogleSheetsService();
      await sheetsService.updatePaymentStatus(
        studentId,
        month,
        payment.amount
      );

      return new NextResponse(null, { status: 200 });
    }

    // Handle other event types if needed
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Webhook handler failed', details: error instanceof Error ? error.message : 'Unknown error' }), 
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
