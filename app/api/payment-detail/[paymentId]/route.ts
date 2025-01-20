// app/api/payment-details/[paymentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PaymentModel } from '@/backend/models/Payment';

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const payment = await PaymentModel.findById(params.paymentId);
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(payment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}