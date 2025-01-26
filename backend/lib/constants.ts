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
    AWAITING_VERIFICATION: 'awaiting_verification',
    EXPIRED: 'expired'
  } as const,
  SESSION_EXPIRATION: {
    CHECKOUT_TIMEOUT_MINUTES: 30,
    DATABASE_CLEANUP_HOURS: 1
  },
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

export const MONTHS = [
  { name: 'July', year: 2024 },
  { name: 'August', year: 2024 },
  { name: 'September', year: 2024 },
  { name: 'October', year: 2024 },
  { name: 'November', year: 2024 },
  { name: 'December', year: 2024 },
  { name: 'January', year: 2025 },
  { name: 'February', year: 2025 },
  { name: 'March', year: 2025 },
];