// src/app/api/payments/verify/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/backend/lib/mongodb';
import { verifyPromptPayPayment } from '@/backend/utils/promptpay';

export async function POST(req: Request) {
    try {
      const { paymentId } = await req.json();
      const client = await clientPromise;
      const db = client.db("fundraising");
      
      // Verify payment with PromptPay API (you'll need to implement this)
      const isVerified = await verifyPromptPayPayment(paymentId);
      
      if (isVerified) {
        await db.collection("payments").updateOne(
          { _id: paymentId },
          { $set: { status: 'paid', paidAt: new Date() } }
        );
        return NextResponse.json({ success: true });
      }
      
      return NextResponse.json({ success: false });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
    }
  }