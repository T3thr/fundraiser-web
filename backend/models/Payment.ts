// @/backend/models/Payment.ts
import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  sessionId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  transactionId: String,
  paidAt: Date,
});

export const PaymentModel = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);