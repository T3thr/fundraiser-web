// @/app/payment/truemoney/[paymentId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Phone, Loader2 } from 'lucide-react';

interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  reference: string;
}

export default function TrueMoneyPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`/api/payments/${params.paymentId}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setPaymentStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load payment details');
      }
    };

    fetchPaymentDetails();
  }, [params.paymentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/truemoney', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: params.paymentId,
          phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      router.push(`/payment/success?session_id=${data.transactionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!paymentStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center space-y-6">
          <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
            <Phone className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>

          <h1 className="text-2xl font-bold text-card-foreground">
            TrueMoney Wallet Payment
          </h1>

          <div className="w-full bg-muted rounded-lg p-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">฿{paymentStatus.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-muted-foreground">Reference:</span>
              <span className="font-medium">{paymentStatus.reference}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-card-foreground mb-1">
                TrueMoney Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812345678"
                className="w-full px-4 py-2 rounded-lg border border-input bg-background text-card-foreground"
                required
                pattern="[0-9]{10}"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 px-4 hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </span>
              ) : (
                'Pay Now'
              )}
            </button>
          </form>

          <button
            onClick={() => router.back()}
            className="w-full bg-secondary text-secondary-foreground rounded-lg py-3 px-4 hover:bg-opacity-90 transition-all duration-200"
          >
            Back to Payment Methods
          </button>
        </div>
      </div>
    </div>
  );
}