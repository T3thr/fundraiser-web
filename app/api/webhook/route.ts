// @/app/api/webhook/route.ts
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import mongodbConnect from '@/backend/lib/mongodb';
import { PaymentModel } from '@/backend/models/Payment';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

// Initialize Google Sheets client
const googleClient = new JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const sheets = google.sheets({ version: 'v4', auth: googleClient });

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = (await headers()).get("stripe-signature")!;

    try {
        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            const { metadata } = session;

            if (!metadata) {
                throw new Error("Metadata is missing");
            }

            const { studentId, month, year } = metadata;

            // Update MongoDB
            await mongodbConnect();
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
                throw new Error("Payment not found in the database");
            }

            // Map months to columns
            const monthColumnMap: { [key: string]: string } = {
                'july': 'E', 'august': 'F', 'september': 'G',
                'october': 'H', 'november': 'I', 'december': 'J',
                'january': 'K', 'february': 'L', 'march': 'M'
            };

            const columnLetter = monthColumnMap[month.toLowerCase()];
            if (!columnLetter) {
                throw new Error("Invalid month provided in metadata");
            }

            // Update "รายชื่อ67" sheet
            const studentRange = 'รายชื่อ67!A6:D';
            const studentResponse = await sheets.spreadsheets.values.get({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: studentRange,
            });

            const rows = studentResponse.data.values;
            if (!rows || rows.length === 0) {
                throw new Error("No data found in the spreadsheet");
            }

            const studentRowIndex = rows.findIndex(row => row[3] === studentId);
            if (studentRowIndex === -1) {
                throw new Error("Student ID not found in the spreadsheet");
            }

            const rowNumber = studentRowIndex + 6; // Data starts from row 6

            await sheets.spreadsheets.values.update({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: `รายชื่อ67!${columnLetter}${rowNumber}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [[session.amount_total ? (session.amount_total / 100).toFixed(2) : '70']]
                }
            });

            // Update "payment_record" sheet
            const paymentRecordRange = 'payment_record!A1:D';
            const paymentRecordResponse = await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SHEET_ID,
                range: paymentRecordRange,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                requestBody: {
                    values: [[
                        new Date().toISOString(),
                        studentId,
                        `${month} ${year}`,
                        session.amount_total ? (session.amount_total / 100).toFixed(2) : '70'
                    ]]
                }
            });

            if (!paymentRecordResponse.status || paymentRecordResponse.status !== 200) {
                throw new Error("Failed to update payment_record sheet");
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        const errorMessage = (error as Error).message;
        return NextResponse.json({ error: errorMessage }, { status: 400 });
    }
}
