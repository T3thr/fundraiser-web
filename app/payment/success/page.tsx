// @/app/payment/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';

interface PaymentStatus {
  isValid: boolean;
  isLoading: boolean;
  error?: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const sessionId = searchParams.get('session_id');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    isValid: false,
    isLoading: true
  });

  useEffect(() => {
    const verifySession = async () => {
      try {
        if (!sessionId) {
          throw new Error('Invalid session');
        }

        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error('Invalid payment session');
        }

        const data = await response.json();
        setPaymentStatus({ isValid: true, isLoading: false });

        // Start countdown only after verification
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              router.push('/');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error) {
        setPaymentStatus({
          isValid: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Payment verification failed'
        });
        router.push('/');
      }
    };

    verifySession();
  }, [sessionId, router]);

  if (paymentStatus.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!paymentStatus.isValid) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-card-foreground">
            Payment Successful!
          </h1>

          <p className="text-center text-muted-foreground">
            Thank you for your payment. Your transaction has been completed successfully.
          </p>

          {sessionId && (
            <p className="text-sm text-muted-foreground bg-muted px-4 py-2 rounded">
              Transaction ID: {sessionId}
            </p>
          )}

          <p className="text-sm text-muted-foreground">
            Redirecting to homepage in {countdown} seconds...
          </p>

          <button
            onClick={() => router.push('/')}
            className="w-full bg-primary text-primary-foreground rounded-lg py-3 px-4 hover:bg-opacity-90 transition-all duration-200"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
}