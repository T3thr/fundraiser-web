// app/api/payments/webhook/route.ts
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import mongodbConnect from '@/backend/lib/mongodb';
import Student from '@/backend/models/Student';
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature")!;

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "payment_intent.succeeded") {
      const { studentId, month, year } = event.data.object.metadata;
      
      await mongodbConnect();
      await Student.updateOne(
        { 
          studentId,
          "payments.month": parseInt(month),
          "payments.year": parseInt(year)
        },
        {
          $set: {
            "payments.$.status": "paid",
            "payments.$.transactionId": event.data.object.id,
            "payments.$.paidAt": new Date()
          }
        }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}