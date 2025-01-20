// @/backend/lib/stripe.ts
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export interface PaymentIntent {
  id: string;
  amount: number;
  status: string;
  studentId: string;
  month: string;
  year: string;
}

export const PAYMENT_CONFIGS = {
    CURRENT_MONTH_FEE: 70,
    LATE_PAYMENT_FEE: 80,
    CURRENCY: 'thb',
    PAYMENT_METHODS: ['card', 'promptpay', 'grabpay', 'truemoney'],
  } as const;