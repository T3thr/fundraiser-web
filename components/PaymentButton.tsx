import React, { useState, useEffect } from 'react';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState(amount);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

  useEffect(() => {
    calculateAmount();
  }, [month, year]);

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
    const baseAmount = (currentYear < year || (currentYear === year && currentMonth <= paymentMonth)) ? 10 : 80;
    setCalculatedAmount(baseAmount);
  };

  // Function to check payment status
  const checkPaymentStatus = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/check-payment-status/${sessionId}`);
      const data = await response.json();
      
      if (data.status === 'completed') {
        setPaymentStatus('completed');
        setIsProcessing(false);
        router.refresh(); // Refresh the page to update payment status
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking payment status:', error);
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
        throw new Error(data.error || 'Payment initiation failed');
      }

      // Handle different payment methods
      const paymentDestination = {
        bank_transfer: `/payment/bank-transfer/${data.paymentId}`,
        truemoney: `/payment/truemoney/${data.paymentId}`,
        rabbit_linepay: `/payment/rabbit-linepay/${data.paymentId}`,
        card: `/payment/${data.sessionId}`,
        promptpay: `/payment/${data.sessionId}`,
      }[selectedMethod] || data.redirectUrl;

      // For card and promptpay payments, set up status checking
      if (['card', 'promptpay'].includes(selectedMethod)) {
        const checkInterval = setInterval(async () => {
          const isComplete = await checkPaymentStatus(data.sessionId);
          if (isComplete) {
            clearInterval(checkInterval);
          }
        }, 5000); // Check every 5 seconds

        // Clear interval after 5 minutes (max waiting time)
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

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={!isOverdue || isProcessing}
        className={`px-2 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
          isOverdue
            ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700'
            : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-800 dark:text-green-300 dark:hover:bg-green-700'
        }`}
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
        ) : isOverdue ? (
          'Pay Now'
        ) : (
          `${amount} ฿`
        )}
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
            <PaymentMethodSelector
              selectedMethod={selectedMethod}
              onMethodSelect={setSelectedMethod}
            />
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
