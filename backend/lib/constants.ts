// @/backend/lib/constants.ts
export const PAYMENT_CONFIGS = {
    CURRENT_MONTH_FEE: 10,
    LATE_PAYMENT_FEE: 80,
    CURRENCY: 'thb',
    SUCCESS_URL: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
    CANCEL_URL: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
  } as const;