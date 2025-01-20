// @/app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { PaymentModel } from '@/backend/models/Payment';
import { sheetsService } from '@/backend/lib/googleSheets';
import { PAYMENT_CONFIGS } from '@/backend/lib/constants';
import { google } from 'googleapis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const monthMapping: { [key: string]: string } = {
  'july': 'กรกฎาคม',
  'august': 'สิงหาคม',
  'september': 'กันยายน',
  'october': 'ตุลาคม',
  'november': 'พฤศจิกายน',
  'december': 'ธันวาคม',
  'january': 'มกราคม',
  'february': 'กุมภาพันธ์',
  'march': 'มีนาคม'
};

const monthColumns: { [key: string]: string } = {
  'กรกฎาคม': 'E', 'สิงหาคม': 'F', 'กันยายน': 'G',
  'ตุลาคม': 'H', 'พฤศจิกายน': 'I', 'ธันวาคม': 'J',
  'มกราคม': 'K', 'กุมภาพันธ์': 'L', 'มีนาคม': 'M'
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersObject = await headers();
    const signature = headersObject.get('stripe-signature')!;

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const { paymentId, studentId, month, year } = session.metadata!;

      // Update payment status in MongoDB
      await PaymentModel.findByIdAndUpdate(paymentId, {
        status: PAYMENT_CONFIGS.PAYMENT_STATUS.COMPLETED,
        transactionId: session.payment_intent as string
      });

      // Update Google Sheets
      const sheets = google.sheets({ version: 'v4', auth: sheetsService.getClient() });

      // Get all student data to find the correct row
      const students = await sheetsService.getStudents();
      const studentIndex = students.findIndex(student => student.id === studentId);

      if (studentIndex === -1) {
        throw new Error('Student not found in Google Sheets');
      }

      // Calculate the row number (adding 6 because data starts from row 6)
      const rowNumber = studentIndex + 6;
      
      // Find the column letter for the month
      const monthInThai = monthMapping[month.toLowerCase()];
      const column = monthColumns[monthInThai];
      const range = `${PAYMENT_CONFIGS.SHEET_NAME}!${column}${rowNumber}`;

      // Update the cell with payment amount
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID!,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[session.amount_total! / 100]] // Convert back from smallest currency unit
        }
      });
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
