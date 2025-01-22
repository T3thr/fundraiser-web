// @/backend/models/Payment.ts
import mongoose from 'mongoose';
//import { PaymentStatus, PaymentMethod } from '@/types/payment';
export interface PaymentSchema {
    studentId: string;
    amount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'awaiting_verification';
    paymentMethod: 'card' | 'bank_transfer' | 'truemoney' | 'promptpay' | 'rabbit_linepay';
    reference: string;
    transactionId?: string;
    sessionId?: string;
    phoneNumber?: string;
    bankTransferRef?: string;
    paymentDetails?: Record<string, any>;
    paidAt?: Date;
    lastUpdated: Date;
    createdAt: Date;
  }

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
}, {
  timestamps: true
});

export const PaymentModel = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);