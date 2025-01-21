import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import PaymentMethodSelector from './PaymentMethodSelector';
import { PaymentMethod } from '@/types/payment';
import { Loader2 } from 'lucide-react';

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

  // Prevent body scroll when modal is open
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
        let checkCount = 0;
        const maxChecks = 60; // 5 minutes with 5-second intervals

        const checkInterval = setInterval(async () => {
          checkCount++;
          const isComplete = await checkPaymentStatus(data.sessionId);
          
          if (isComplete || checkCount >= maxChecks) {
            clearInterval(checkInterval);
            if (!isComplete && checkCount >= maxChecks) {
              setPaymentStatus('failed');
            }
          }
        }, 5000);
      }

      router.push(paymentDestination);
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setPaymentStatus('failed');
    } finally {
      setIsModalOpen(false);
    }
  };

  const buttonStateClass = `
    px-2 py-1 rounded-md text-sm font-medium transition-colors duration-200
    ${paymentStatus === 'failed' 
      ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700'
      : isOverdue
        ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-800 dark:text-red-300 dark:hover:bg-red-700'
        : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-800 dark:text-green-300 dark:hover:bg-green-700'
    }
    ${(!isOverdue || isProcessing) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
  `;

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={!isOverdue || isProcessing}
        className={buttonStateClass}
        aria-label="Open payment modal"
      >
        {isProcessing ? (
          <span className="flex items-center space-x-1">
            <Loader2 className="h-4 w-4 animate-spin" />
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

      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        modal
      >
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="container flex items-center justify-center min-h-screen">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-2xl w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
              <PaymentMethodSelector
                selectedMethod={selectedMethod}
                onMethodSelect={setSelectedMethod}
              />
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    'Continue to Payment'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
