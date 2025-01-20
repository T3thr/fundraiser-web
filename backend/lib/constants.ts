// @/backend/lib/constants.ts
export const PAYMENT_CONFIGS = {
    CURRENT_MONTH_FEE: 70,
    LATE_PAYMENT_FEE: 80,
    CURRENCY: 'thb',
    SHEET_NAME: 'รายชื่อ67',
    STUDENT_RANGE: 'A6:D',
    PAYMENT_STATUS: {
      PENDING: 'pending',
      PROCESSING: 'processing',
      COMPLETED: 'completed',
      FAILED: 'failed',
      REFUNDED: 'refunded',
      AWAITING_VERIFICATION: 'awaiting_verification'
    } as const,
    SUCCESS_URL: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
    CANCEL_URL: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
  } as const;