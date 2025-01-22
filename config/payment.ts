// @/config/payment.ts
export const PAYMENT_CONFIG = {
    FEES: {
      CURRENT_MONTH: 1,
      LATE_PAYMENT: 80,
      SPECIAL_EVENT: 100,
    },
    CURRENCY: {
      CODE: 'thb',
      SYMBOL: '฿',
      DECIMAL_PLACES: 2,
    },
    PAYMENT_METHODS: {
      CARD: {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: 'credit-card',
        enabled: true,
        processingTime: 'Instant',
      },
      PROMPTPAY: {
        id: 'promptpay',
        name: 'PromptPay QR',
        icon: 'qr-code',
        enabled: true,
        processingTime: 'Within 5 minutes',
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
      },
      GRABPAY: {
        id: 'grabpay',
        name: 'GrabPay',
        icon: 'smartphone',
        enabled: true,
        processingTime: 'Instant',
        expiresIn: 15 * 60, // 15 minutes in seconds
      },
      TRUEMONEY: {
        id: 'truemoney',
        name: 'TrueMoney Wallet',
        icon: 'wallet',
        enabled: true,
        processingTime: 'Within 15 minutes',
      },
      BANK_TRANSFER: {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        icon: 'bank',
        enabled: true,
        processingTime: '1-2 business days',
        requiresVerification: true,
      },
    },
    PAYMENT_EXPIRY: {
      DEFAULT: 24 * 60 * 60, // 24 hours in seconds
      MINIMUM: 15 * 60, // 15 minutes in seconds
      MAXIMUM: 7 * 24 * 60 * 60, // 7 days in seconds
    },
    VALIDATION: {
      MIN_AMOUNT: 1,
      MAX_AMOUNT: 100000,
    },
    RATE_LIMIT: {
      MAX_ATTEMPTS: 10,
      WINDOW: 60 * 1000, // 1 minute in milliseconds
    },
    SUPPORTED_PAYMENT_METHODS: ['card', 'paypal','truemoney','promptpay','grabpay','banktransfer'],
  } as const;
  
  export type PaymentMethod = keyof typeof PAYMENT_CONFIG.PAYMENT_METHODS;
  
  export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    paymentMethod: PaymentMethod;
    metadata: Record<string, any>;
    createdAt: Date;
    expiresAt: Date;
  }
  
  export type PaymentStatus = 
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'expired'
    | 'cancelled';
  
  export interface CreatePaymentOptions {
    amount: number;
    studentId: string;
    month: string;
    year: number;
    paymentMethod?: PaymentMethod;
    metadata?: Record<string, any>;
  }
  
  export interface PaymentResult {
    success: boolean;
    sessionId?: string;
    error?: string;
    paymentIntent?: PaymentIntent;
  }
  
  export interface VerifyPaymentOptions {
    sessionId: string;
    paymentMethod: PaymentMethod;
  }
  