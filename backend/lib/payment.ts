// @/backend/lib/payment.ts
import { PaymentMethod } from '@/types/payment';
import { stripe } from './stripe';
import { PAYMENT_CONFIGS } from './constants';

export async function createStripeSession({
  amount,
  studentId,
  month,
  year,
  paymentMethod,
}: {
  amount: number;
  studentId: string;
  month: string;
  year: number;
  paymentMethod: PaymentMethod;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: [paymentMethod === 'card' ? 'card' : 'promptpay'],
    line_items: [
      {
        price_data: {
          currency: PAYMENT_CONFIGS.CURRENCY,
          product_data: {
            name: `Monthly Fee - ${month} ${year}`,
            description: `Student ID: ${studentId}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    metadata: {
      studentId,
      month,
      year,
    },
    mode: 'payment',
    success_url: `${PAYMENT_CONFIGS.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: PAYMENT_CONFIGS.CANCEL_URL,
  });

  return session;
}