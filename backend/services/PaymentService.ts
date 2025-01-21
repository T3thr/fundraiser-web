// @/backend/services/PaymentService.ts
import { PaymentModel } from '@/backend/models/Payment';
import { sheetsService } from '@/backend/lib/googleSheets';
import { PAYMENT_CONFIGS } from '@/backend/lib/constants';
import mongodbConnect from '@/backend/lib/mongodb';

export class PaymentService {
  static async updatePaymentStatus(
    sessionId: string,
    status: string,
    transactionDetails?: {
      transactionId?: string;
      paidAt?: Date;
    }
  ): Promise<void> {
    await mongodbConnect();

    const payment = await PaymentModel.findOne({ sessionId });
    if (!payment) {
      throw new Error(`Payment not found for session ID: ${sessionId}`);
    }

    const updateData: any = {
      status,
      lastUpdated: new Date()
    };

    if (status === PAYMENT_CONFIGS.PAYMENT_STATUS.COMPLETED) {
      updateData.paidAt = transactionDetails?.paidAt || new Date();
      if (transactionDetails?.transactionId) {
        updateData.transactionId = transactionDetails.transactionId;
      }
    }

    await PaymentModel.findByIdAndUpdate(
      payment._id,
      updateData,
      { new: true }
    );

    if (status === PAYMENT_CONFIGS.PAYMENT_STATUS.COMPLETED) {
      await this.updateGoogleSheets(payment);
    }
  }

  static async updateGoogleSheets(payment: any): Promise<void> {
    try {
      const { studentId, month, amount } = payment;
      const monthKey = month.toLowerCase().slice(0, 3);
      
      const sheets = await sheetsService.getSheetsInstance();
      const range = `${PAYMENT_CONFIGS.SHEET_NAME}!${PAYMENT_CONFIGS.STUDENT_RANGE}`;
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range,
      });

      const rows = response.data.values;
      const studentRowIndex = rows.findIndex((row: string[]) => row[3] === studentId);
      
      if (studentRowIndex === -1) {
        throw new Error(`Student not found in sheets: ${studentId}`);
      }

      const monthColumns = {
        กรกฎาคม: 'E', สิงหาคม: 'F', กันยายน: 'G', ตุลาคม: 'H',
        พฤศจิกายน: 'I', ธันวาคม: 'J', มกราคม: 'K', กุมภาพันธ์: 'L', มีนาคม: 'M'
      };

      const column = monthColumns[monthKey as keyof typeof monthColumns];
      const rowNumber = studentRowIndex + 6;

      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `${PAYMENT_CONFIGS.SHEET_NAME}!${column}${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[amount.toString()]]
        }
      });
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
      throw error;
    }
  }
}