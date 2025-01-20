import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import mongodbConnect from '@/backend/lib/mongodb';
import { PaymentModel } from '@/backend/models/Payment';
import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';
import Stripe from "stripe";

// Initialize Stripe with the latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

// Initialize Google Sheets client with error handling
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

// Month mapping for Google Sheets columns
const MONTH_COLUMN_MAP: { [key: string]: string } = {
    'july': 'E', 'august': 'F', 'september': 'G',
    'october': 'H', 'november': 'I', 'december': 'J',
    'january': 'K', 'february': 'L', 'march': 'M'
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const headersObject = await headers();
        const signature = headersObject.get("stripe-signature");

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing stripe signature' },
                { status: 401 }
            );
        }

        // Verify Stripe webhook
        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const { metadata } = session;

            if (!metadata?.studentId || !metadata?.month || !metadata?.year) {
                throw new Error("Invalid metadata in session");
            }

            // Connect to MongoDB
            await mongodbConnect();

            // Update payment record
            const payment = await PaymentModel.findOneAndUpdate(
                { sessionId: session.id },
                {
                    status: 'completed',
                    paidAt: new Date(),
                    transactionId: session.payment_intent as string,
                },
                { new: true }
            );

            if (!payment) {
                throw new Error("Payment record not found");
            }

            // Initialize Google Sheets client
            const googleClient = initializeGoogleClient();
            const sheets = google.sheets({ version: 'v4', auth: googleClient });

            // Update Google Sheets
            await updateGoogleSheets(
                sheets,
                metadata.studentId,
                metadata.month,
                metadata.year,
                session.amount_total ? session.amount_total / 100 : 70
            );

            return NextResponse.json({
                received: true,
                paymentId: payment._id
            });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        return NextResponse.json(
            { error: errorMessage },
            { status: 400 }
        );
    }
}