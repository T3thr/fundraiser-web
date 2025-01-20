// @/app/payment/bank-transfer/[paymentId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface BankTransferDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  reference: string;
  amount: number;
  status: string;
}

export default function BankTransferPage({ params }: { params: { paymentId: string } }) {
  const router = useRouter();
  const [details, setDetails] = useState<BankTransferDetails | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/payment-details/${params.paymentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }
        const data = await response.json();
        if (data.paymentMethod !== 'bank_transfer') {
          throw new Error('Invalid payment method');
        }
        setDetails(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      }
    };

    fetchDetails();
  }, [params.paymentId]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-card-foreground mb-2">Error</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground rounded-lg py-2 px-4 hover:bg-opacity-90 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Homepage</span>
          </button>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const transferDetails = [
    { label: 'Bank Name', value: details.bankName },
    { label: 'Account Number', value: details.accountNumber },
    { label: 'Account Name', value: details.accountName },
    { label: 'Reference Number', value: details.reference },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-card-foreground mb-6 text-center">
          Bank Transfer Details
        </h1>
        
        <div className="space-y-6">
          <div className="text-center mb-8">
            <p className="text-3xl font-bold text-primary mb-2">
              ฿{details.amount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              Please transfer the exact amount to verify your payment
            </p>
          </div>

          {transferDetails.map((item) => (
            <div 
              key={item.label} 
              className="bg-muted rounded-lg p-4 hover:bg-muted/80 transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-muted-foreground">
                  {item.label}
                </label>
                <button
                  onClick={() => copyToClipboard(item.value, item.label)}
                  className="text-primary hover:text-primary/80 transition-colors p-1 rounded-md hover:bg-muted-foreground/10"
                  aria-label={`Copy ${item.label}`}
                >
                  {copied === item.label ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-card-foreground font-medium select-all">
                {item.value}
              </p>
            </div>
          ))}

          <div className="mt-8 space-y-4">
            <button
              onClick={() => router.push(`/payment/upload-slip/${params.paymentId}`)}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 px-4 hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Upload Payment Slip</span>
            </button>
            <button
              onClick={() => router.back()}
              className="w-full bg-secondary text-secondary-foreground rounded-lg py-3 px-4 hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-6">
            After completing the transfer, please upload your payment slip for verification
          </p>
        </div>
      </div>
    </div>
  );
}