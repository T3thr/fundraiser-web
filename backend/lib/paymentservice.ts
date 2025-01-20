// @/backend/lib/paymentservice.ts
import { PaymentModel } from '@/backend/models/Payment';
import { sheetsService } from './googleSheets';

export class PaymentService {
  static async updatePaymentStatus(sessionId: string, status: string): Promise<void> {
    const payment = await PaymentModel.findOne({ sessionId });
    
    if (!payment) {
      throw new Error(`Payment not found for session ${sessionId}`);
    }

    // Update payment status in database
    payment.status = status;
    await payment.save();

    // If payment is completed, update Google Sheets
    if (status === 'completed') {
      await sheetsService.updatePaymentStatus(
        payment.studentId,
        payment.month,
        payment.amount
      );
    }
  }
}