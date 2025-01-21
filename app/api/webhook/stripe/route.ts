// @/app/api/webhook/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import mongodbConnect from '@/backend/lib/mongodb';
import { PaymentModel } from '@/backend/models/Payment';

// Constants for month mapping
const MONTH_COLUMNS: Record<string, string> = {
  'กรกฎาคม': 'E', 'สิงหาคม': 'F', 'กันยายน': 'G',
  'ตุลาคม': 'H', 'พฤศจิกายน': 'I', 'ธันวาคม': 'J',
  'มกราคม': 'K', 'กุมภาพันธ์': 'L', 'มีนาคม': 'M'
};

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

class GoogleSheetsService {
  private client: JWT;
  private sheets: any;

  constructor() {
    try {
      this.client = new JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      this.sheets = google.sheets({ version: 'v4', auth: this.client });
    } catch (error) {
      console.error('Google Sheets initialization error:', error);
      throw new Error('Failed to initialize Google Sheets service');
    }
  }

  async findStudentRow(studentId: string): Promise<number> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: 'รายชื่อ67!A6:D',
      });

      const rows = response.data.values as string[][]; // Explicitly type rows as a 2D array of strings
      if (!rows?.length) {
        throw new Error('No student data found in sheet');
      }

      const studentRowIndex = rows.findIndex((row: string[]) => row[3] === studentId);
      if (studentRowIndex === -1) {
        throw new Error(`Student ID ${studentId} not found in sheet`);
      }

      return studentRowIndex + 6; // Add 6 because data starts from row 6
    } catch (error) {
      console.error('Error finding student row:', error);
      throw error;
    }
  }

  async updatePaymentRecord(studentId: string, month: string, amount: number): Promise<void> {
    try {
      console.log(`Updating payment record for student ${studentId}, month ${month}, amount ${amount}`);

      const columnLetter = MONTH_COLUMNS[month];
      if (!columnLetter) {
        throw new Error(`Invalid month: ${month}`);
      }

      const rowNumber = await this.findStudentRow(studentId);
      const range = `รายชื่อ67!${columnLetter}${rowNumber}`;

      console.log(`Updating cell ${range} with amount ${amount}`);

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[amount.toFixed(2)]],
        },
      });

      console.log('Successfully updated Google Sheets');
    } catch (error) {
      console.error('Error updating payment record:', error);
      throw error;
    }
  }
}

export async function POST(req: NextRequest) {
  console.log('Received webhook request');

  try {
    // Connect to MongoDB
    await mongodbConnect();

    // Get the raw request body and Stripe signature
    const body = await req.text();
    const stripeHeaders = new Headers(); // Use headers function without .get()
    const signature = stripeHeaders.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found');
      return NextResponse.json(
        { error: 'No Stripe signature' },
        { status: 400 }
      );
    }

    // Verify Stripe webhook
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Webhook event type:', event.type);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (!session.metadata?.studentId || !session.metadata?.month) {
        throw new Error('Missing required metadata');
      }

      console.log('Processing completed checkout session:', session.id);

      // Update payment status in MongoDB
      const payment = await PaymentModel.findOneAndUpdate(
        { sessionId: session.id },
        {
          status: 'completed',
          transactionId: session.payment_intent as string,
          paidAt: new Date(),
        },
        { new: true }
      );

      if (!payment) {
        console.error('Payment record not found for session:', session.id);
        throw new Error('Payment record not found');
      }

      console.log('Payment record updated:', payment._id);

      // Update Google Sheets
      const sheetsService = new GoogleSheetsService();
      await sheetsService.updatePaymentRecord(
        session.metadata.studentId,
        session.metadata.month,
        payment.amount
      );

      console.log('Successfully processed webhook');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        error: 'Webhook handler failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}
