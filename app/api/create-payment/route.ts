import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/backend/lib/stripe';
import mongodbConnect from '@/backend/lib/mongodb';
import { PaymentModel } from '@/backend/models/Payment';
import { PAYMENT_CONFIGS } from '@/backend/lib/constants';
import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';

// Month mapping for Google Sheets columns
const MONTH_COLUMN_MAP: { [key: string]: string } = {
  'กรกฎาคม': 'E', 'สิงหาคม': 'F', 'กันยายน': 'G',
  'ตุลาคม': 'H', 'พฤศจิกายน': 'I', 'ธันวาคม': 'J',
  'มกราคม': 'K', 'กุมภาพันธ์': 'L', 'มีนาคม': 'M'
};

// Initialize Google Sheets client
const initializeGoogleClient = (): JWT => {
  try {
    return new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  } catch (error) {
    console.error('Failed to initialize Google client:', error);
    throw new Error('Google Sheets authentication failed');
  }
};

// Helper function to update Google Sheets
async function updateGoogleSheets(
  sheets: sheets_v4.Sheets,
  studentId: string,
  month: string,
  year: string,
  amount: number
): Promise<void> {
  const columnLetter = MONTH_COLUMN_MAP[month.toLowerCase()];
  if (!columnLetter) {
    throw new Error(`Invalid month: ${month}`);
  }

  // Find student row
  const studentResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'รายชื่อ67!A6:D',
  });

  const rows = studentResponse.data.values;
  if (!rows?.length) {
    throw new Error('No student data found');
  }

  const studentRowIndex = rows.findIndex((row: string[]) => row[3] === studentId);
  if (studentRowIndex === -1) {
    throw new Error(`Student ID ${studentId} not found`);
  }

  const rowNumber = studentRowIndex + 6;

  // Batch update for both sheets
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: [
        {
          range: `รายชื่อ67!${columnLetter}${rowNumber}`,
          values: [[amount.toFixed(2)]]
        },
        {
          range: 'payment_record!A:D',
          values: [[
            new Date().toISOString(),
            studentId,
            `${month} ${year}`,
            amount.toFixed(2)
          ]]
        }
      ]
    }
  });
}

// Handle successful payment completion
async function handlePaymentSuccess(
  sessionId: string,
  studentId: string,
  month: string,
  year: string,
  amount: number
) {
  // Update payment record
  const payment = await PaymentModel.findOneAndUpdate(
    { sessionId },
    {
      status: 'completed',
      paidAt: new Date(),
      transactionId: sessionId,
    },
    { new: true }
  );

  if (!payment) {
    throw new Error("Payment record not found");
  }

  // Initialize Google Sheets client and update sheets
  const googleClient = initializeGoogleClient();
  const sheets = google.sheets({ version: 'v4', auth: googleClient });
  
  await updateGoogleSheets(
    sheets,
    studentId,
    month,
    year,
    amount
  );

  return payment;
}

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
                unit_amount: amount * 100,
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
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
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

        // After successful bank transfer verification
        await handlePaymentSuccess(
          refNumber,
          studentId,
          month,
          year,
          amount
        );

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

        // After successful payment verification
        await handlePaymentSuccess(
          reference,
          studentId,
          month,
          year,
          amount
        );

        sessionData = {
          paymentId: paymentRecord._id,
          reference,
          redirectUrl: `/payment/${paymentMethod}/${paymentRecord._id}`,
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