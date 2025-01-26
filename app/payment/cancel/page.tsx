// @/app/payment/cancel/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Use a small timeout to navigate after rendering
          setTimeout(() => {
            router.push('/');
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-card-foreground">
            Payment Cancelled
          </h1>

          <p className="text-center text-muted-foreground">
            Your payment was cancelled. No charges were made to your account.
          </p>

          <p className="text-sm text-muted-foreground">
            Redirecting to homepage in {countdown} seconds...
          </p>

          <div className="flex flex-col w-full space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 px-4 hover:bg-opacity-90 transition-all duration-200"
            >
              Return to Homepage
            </button>
            <button
              onClick={() => router.back()}
              className="w-full bg-secondary text-secondary-foreground rounded-lg py-3 px-4 hover:bg-opacity-90 transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
