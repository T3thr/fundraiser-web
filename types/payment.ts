// @/types/payment.ts
export type PaymentMethod = 'card' | 'promptpay' | 'bank_transfer' | 'truemoney' | 'rabbit_linepay';

export interface PaymentDetails {
  id: string;
  studentId: string;
  month: string;
  year: number;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  currency: string;
  description?: string;
  transactionId?: string;
  sessionId?: string;
  bankTransferRef?: string;
  qrCodeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed' | 'awaiting_verification';
  sessionId?: string;
  transactionId?: string;
  paidAt?: Date;
}
