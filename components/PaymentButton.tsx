import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PaymentMethodSelector from './PaymentMethodSelector';
import { PaymentMethod } from '@/types/payment';

interface PaymentButtonProps {
  amount: number;
  studentId: string;
  month: string;
  year: number;
  isOverdue: boolean;
}

export default function PaymentButton({ amount, studentId, month, year, isOverdue }: PaymentButtonProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState(amount);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

  // Handle modal open/close effects
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen]);

  const calculateAmount = useCallback(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthMap: { [key: string]: number } = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3,
      'may': 4, 'june': 5, 'july': 6, 'august': 7,
      'september': 8, 'october': 9, 'november': 10, 'december': 11
    };

    const paymentMonth = monthMap[month.toLowerCase()];
    const baseAmount = (currentYear < year || (currentYear === year && currentMonth <= paymentMonth)) ? 10 : 80;
    setCalculatedAmount(baseAmount);
  }, [month, year]);

  useEffect(() => {
    calculateAmount();
  }, [calculateAmount]);

  const checkPaymentStatus = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/check-payment-status/${sessionId}`);
      const data = await response.json();
      
      if (data.status === 'completed') {
        setPaymentStatus('completed');
        setIsProcessing(false);
        router.refresh();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('failed');
      return false;
    }
  };

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentStatus('processing');

      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        setPaymentStatus('failed');
        throw new Error(data.error || 'Payment initiation failed');
      }

      const paymentDestination = {
        bank_transfer: `/payment/bank-transfer/${data.paymentId}`,
        truemoney: `/payment/truemoney/${data.paymentId}`,
        rabbit_linepay: `/payment/rabbit-linepay/${data.paymentId}`,
        card: `/payment/${data.sessionId}`,
        promptpay: `/payment/${data.sessionId}`,
      }[selectedMethod] || data.redirectUrl;

      if (['card', 'promptpay'].includes(selectedMethod)) {
        const checkInterval = setInterval(async () => {
          const isComplete = await checkPaymentStatus(data.sessionId);
          if (isComplete) {
            clearInterval(checkInterval);
          }
        }, 5000);

        setTimeout(() => {
          clearInterval(checkInterval);
        }, 300000);
      }

      router.push(paymentDestination);
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setPaymentStatus('failed');
    } finally {
      setIsModalOpen(false);
    }
  };

  const buttonStateClass = paymentStatus === 'failed' 
    ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700'
    : isOverdue
      ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700'
      : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-800 dark:text-green-300 dark:hover:bg-green-700';

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={!isOverdue || isProcessing}
        className={`px-2 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${buttonStateClass} 
          hover:scale-105 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing ? (
          <span className="flex items-center space-x-1">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Processing...</span>
          </span>
        ) : paymentStatus === 'failed' ? (
          'Retry Payment'
        ) : isOverdue ? (
          'Pay Now'
        ) : (
          `${amount} ฿`
        )}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden backdrop-blur-sm bg-black/50">
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
            <div
              ref={modalRef}
              className="inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-lg scale-95 animate-in fade-in duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Select Payment Method
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onMethodSelect={setSelectedMethod}
              />
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 
                    transition-colors duration-200 transform hover:scale-105 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 
                    transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
                >
                  {isProcessing ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
