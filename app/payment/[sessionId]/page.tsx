// @/app/payment/[sessionId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentStatus {
  status: 'loading' | 'redirecting' | 'error' | 'success';
  message?: string;
}

export default function PaymentPage() {
  const { sessionId } = useParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'loading',
    message: 'Initializing payment...'
  });
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (paymentStatus.status === 'error') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            router.push('/');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [paymentStatus.status, router]);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        if (!sessionId) {
          throw new Error('Invalid session ID');
        }

        setPaymentStatus({
          status: 'loading',
          message: 'Connecting to payment gateway...'
        });

        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Failed to initialize payment provider');
        }

        setPaymentStatus({
          status: 'redirecting',
          message: 'Redirecting to secure payment page...'
        });

        const { error } = await stripe.redirectToCheckout({
          sessionId: sessionId as string,
        });

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Payment initialization error:', error);
        setPaymentStatus({
          status: 'error',
          message: error instanceof Error ? error.message : 'Payment initialization failed'
        });
      }
    };

    initializePayment();
  }, [sessionId]);

  const StatusComponent = () => {
    switch (paymentStatus.status) {
      case 'loading':
      case 'redirecting':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {paymentStatus.status === 'loading' ? 'Preparing Payment' : 'Redirecting'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{paymentStatus.message}</p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Payment Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{paymentStatus.message}</p>
            <p className="text-sm text-gray-500">
              Redirecting to homepage in {countdown} seconds...
            </p>
            <div className="flex flex-col space-y-2 w-full max-w-xs">
              <button
                onClick={() => router.push('/')}
                className="w-full px-4 py-2 text-white bg-primary rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Return to Homepage
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-800 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Payment Successful
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your payment has been processed successfully.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <StatusComponent />
      </div>
    </div>
  );
}