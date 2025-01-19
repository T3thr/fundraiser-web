// app/types/index.ts
export interface Student {
    _id: string;
    name: string;
    payments: {
      month: string;
      status: 'paid' | 'unpaid';
      amount: number;
      timestamp?: Date;
    }[];
  }