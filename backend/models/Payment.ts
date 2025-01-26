// @/backend/models/Payment.ts
import mongoose from 'mongoose';
//import { PaymentStatus, PaymentMethod } from '@/types/payment';

const paymentSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'awaiting_verification'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'promptpay', 'bank_transfer', 'truemoney', 'rabbit_linepay'],
    required: true
  },
  currency: { type: String, default: 'thb' },
  sessionId: String,
  bankTransferRef: String,
  qrCodeUrl: String,
  transactionId: String,
  metadata: { type: Map, of: String },
  verificationImage: String,
  verificationDate: Date,
  expiresAt: { type: Date, expires: 0 },
}, {
  timestamps: true
});

export const PaymentModel = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);