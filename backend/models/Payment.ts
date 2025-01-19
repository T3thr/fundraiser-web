import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  month: { type: String, required: true },
  paid: { type: Boolean, default: false },
  paymentDate: { type: Date },
  amount: { type: Number, required: true }
});

export const Payment = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);