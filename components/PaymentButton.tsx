import React from 'react';
import { useRouter } from 'next/navigation';

interface PaymentButtonProps {
  amount: number;
  studentId: string;
  month: string;
  year: number;
  isOverdue: boolean;
}

export default function PaymentButton({ amount, studentId, month, year, isOverdue }: PaymentButtonProps) {
  const router = useRouter();

  const handlePayment = async () => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const monthMap: { [key: string]: number } = {
        'january': 0, 'february': 1, 'march': 2, 'april': 3,
        'may': 4, 'june': 5, 'july': 6, 'august': 7,
        'september': 8, 'october': 9, 'november': 10, 'december': 11
      };

      const paymentMonth = monthMap[month.toLowerCase()];
      const baseAmount = (currentYear < year || (currentYear === year && currentMonth <= paymentMonth)) ? 70 : 80;

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: baseAmount,
          studentId,
          month,
          year,
        }),
      });

      const { sessionId } = await response.json();
      router.push(`/payment/${sessionId}`);
    } catch (error) {
      console.error('Payment initiation failed:', error);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={!isOverdue}
      className={`px-2 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
        isOverdue
          ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700 cursor-pointer'
          : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-800 dark:text-green-300 dark:hover:bg-green-700'
      }`}
    >
      {isOverdue ? 'Pay Now' : `${amount} ฿`}
    </button>
  );
}