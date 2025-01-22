// @/backend/lib/constants.ts
export const PAYMENT_CONFIGS = {
    CURRENT_MONTH_FEE: 10,
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

export const MONTH_MAPPINGS = {
  // English to Thai
  january: 'มกราคม',
  february: 'กุมภาพันธ์',
  march: 'มีนาคม',
  april: 'เมษายน',
  may: 'พฤษภาคม',
  june: 'มิถุนายน',
  july: 'กรกฎาคม',
  august: 'สิงหาคม',
  september: 'กันยายน',
  october: 'ตุลาคม',
  november: 'พฤศจิกายน',
  december: 'ธันวาคม',
  
  // Thai to column mapping
  'มกราคม': 'K',
  'กุมภาพันธ์': 'L',
  'มีนาคม': 'M',
  'เมษายน': 'N',
  'พฤษภาคม': 'O',
  'มิถุนายน': 'P',
  'กรกฎาคม': 'E',
  'สิงหาคม': 'F',
  'กันยายน': 'G',
  'ตุลาคม': 'H',
  'พฤศจิกายน': 'I',
  'ธันวาคม': 'J'
};
