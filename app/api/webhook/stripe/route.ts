// @/app/api/webhook/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import mongodbConnect from '@/backend/lib/mongodb';
import { PaymentModel } from '@/backend/models/Payment';

// Constants
const MONTH_COLUMNS: Record<string, string> = {
  'กรกฎาคม': 'E', 'สิงหาคม': 'F', 'กันยายน': 'G',
  'ตุลาคม': 'H', 'พฤศจิกายน': 'I', 'ธันวาคม': 'J',
  'มกราคม': 'K', 'กุมภาพันธ์': 'L', 'มีนาคม': 'M'
};

class GoogleSheetsService {
  private client: JWT;
  private sheets: any;

  constructor() {
    this.client = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL!,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.client });
  }

  async updatePaymentRecord(studentId: string, month: string, amount: number): Promise<void> {
    const columnLetter = MONTH_COLUMNS[month];
    if (!columnLetter) {
      throw new Error(`Invalid month: ${month}`);
    }

    // Find student row
    const { data: { values: rows } } = await this.sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: 'รายชื่อ67!A6:D',
    });

    if (!rows?.length) {
      throw new Error('No student data found');
    }

    const studentRowIndex = rows.findIndex((row: string[]) => row[3] === studentId);
    if (studentRowIndex === -1) {
      throw new Error(`Student ID ${studentId} not found`);
    }

    const rowNumber = studentRowIndex + 6;
    
    // Update sheet
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID!,
      range: `รายชื่อ67!${columnLetter}${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[amount.toFixed(2)]]
      }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    await mongodbConnect();
    const body = await req.text();
    const headersObject = await headers();
    const signature = headersObject.get('stripe-signature')!;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-12-18.acacia',
    });

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { studentId, month } = session.metadata!;

      // Update payment status
      const payment = await PaymentModel.findOneAndUpdate(
        { sessionId: session.id },
        {
          status: 'completed',
          transactionId: session.payment_intent as string,
          paidAt: new Date()
        },
        { new: true }
      );

      if (!payment) {
        throw new Error('Payment not found');
      }

      // Update Google Sheets
      const sheetsService = new GoogleSheetsService();
      await sheetsService.updatePaymentRecord(
        studentId,
        month,
        payment.amount
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
