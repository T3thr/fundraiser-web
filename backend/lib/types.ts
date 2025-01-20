// @/backend/lib/types.ts
export interface PaymentSession {
    id: string;
    metadata: {
      studentId: string;
      month: string;
      year: string;
      amount: number;
    };
  }
  