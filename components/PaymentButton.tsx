import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PaymentMethodSelector from './PaymentMethodSelector';
import { PaymentMethod } from '@/types/payment';
import { PAYMENT_CONFIGS } from '@/backend/lib/constants';

interface PaymentButtonProps {
  amount: number;
  studentId: string;
  month: string;
  year: number;
  isOverdue: boolean;
  studentName: string;
  selectedMonths: string[];
  onMonthSelection: (month: string) => void;
}

export default function PaymentButton({ amount, studentId, month, year, isOverdue, studentName }: PaymentButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculatedAmount, setCalculatedAmount] = useState(amount);
  const [expirationText, setExpirationText] = useState<string | null>(null);

  useEffect(() => {
    const calculateAmount = () => {
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
      setCalculatedAmount(baseAmount);
    };

    calculateAmount();
  }, [month, year]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isModalOpen]);
  

  const handlePayment = async () => {
    try {
      setError(null);
      setIsProcessing(true);

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: calculatedAmount,
          studentId,
          month,
          year,
          paymentMethod: selectedMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment initiation failed');
      }

      // Set the expiration text from constants
      setExpirationText(PAYMENT_CONFIGS.SESSION_EXPIRATION.TEXT);

      const redirectMap = {
        bank_transfer: `/payment/bank-transfer/${data.paymentId}`,
        truemoney: `/payment/truemoney/${data.paymentId}`,
        rabbit_linepay: `/payment/rabbit-linepay/${data.paymentId}`,
        card: `/payment/${data.sessionId}`,
        promptpay: `/payment/${data.sessionId}`,
      };

      router.push(redirectMap[selectedMethod] || data.redirectUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Payment failed');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={!isOverdue || isProcessing}
        className={`
          relative px-3 py-1.5 rounded-md text-sm font-medium
          transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          group hover:shadow-md
          ${isOverdue 
            ? 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700'
            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 focus:ring-emerald-500 dark:bg-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-700'
          }
        `}
      >
        <span className="flex items-center space-x-1 justify-center">
          {isOverdue ? 'Pay' : `${amount} ฿`}
        </span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full mx-4 shadow-xl transform transition-all animate-slideIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {studentName} - Payment Details
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Student ID:</span>
                  <span className="font-medium">{studentId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Selected Month:</span>
                  <span className="font-medium">{month} {year}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-medium">{calculatedAmount} ฿</span>
                </div>
                {/* แสดงเวลาหมดอายุ */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Payment Validity:</span>
                  <span className="font-medium text-red-600">
                    เมื่อไปยังหน้าชำระแล้วโปรดชำระภายใน {PAYMENT_CONFIGS.SESSION_EXPIRATION.TEXT} นาที
                  </span>
                </div>
              </div>

              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onMethodSelect={setSelectedMethod}
              />

              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 
                    dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                    transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200 flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Proceed to Payment</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}