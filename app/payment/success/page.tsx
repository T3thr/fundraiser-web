// @/app/payment/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
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
  }, [router]);

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