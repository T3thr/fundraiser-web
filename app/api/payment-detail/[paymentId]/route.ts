// @/app/api/payment-details/[paymentId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongodbConnect from '@/backend/lib/mongodb';
import { PaymentModel } from '@/backend/models/Payment';

// Define an interface for the payment object
interface Payment {
  createdAt: Date;
  status: string;
  paymentMethod: string; // Add paymentMethod to the interface
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    reference: string;
  };
  // Add other properties as needed
}

export async function GET(
  request: NextRequest,
  context: { params: { paymentId: string } }  // Fix: Specify the correct type for context
) {
  try {
    // Access paymentId from context params
    const { paymentId } = context.params;

    await mongodbConnect();
    const paymentData = await PaymentModel.findById(paymentId)
      .select('-__v')
      .lean();

    if (!paymentData || Array.isArray(paymentData)) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Create a payment object that conforms to the Payment interface
    const payment: Payment = {
      createdAt: paymentData.createdAt,
      status: paymentData.status,
      paymentMethod: paymentData.paymentMethod,
    };

    // Add bank details for bank transfers
    if (payment.paymentMethod === 'bank_transfer') {
      payment.bankDetails = {
        bankName: process.env.BANK_NAME || 'Default Bank Name',
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || '0000000000',
        accountName: process.env.BANK_ACCOUNT_NAME || 'Default Account Name',
        reference: paymentData.reference,
      };
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Payment details fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment details' },
      { status: 500 }
    );
  }
}
