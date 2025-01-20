// @/app/payment/bank-transfer/[paymentId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

interface BankTransferDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  reference: string;
  amount: number;
}

export default function BankTransferPage({ params }: { params: { paymentId: string } }) {
  const [details, setDetails] = useState<BankTransferDetails | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`/api/payment-details/${params.paymentId}`);
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error('Failed to fetch payment details:', error);
      }
    };

    fetchDetails();
  }, [params.paymentId]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!details) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              Please transfer the exact amount
            </p>
          </div>

          {[
            { label: 'Bank Name', value: details.bankName },
            { label: 'Account Number', value: details.accountNumber },
            { label: 'Account Name', value: details.accountName },
            { label: 'Reference Number', value: details.reference },
          ].map((item) => (
            <div key={item.label} className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm text-muted-foreground">
                  {item.label}
                </label>
                <button
                  onClick={() => copyToClipboard(item.value, item.label)}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  {copied === item.label ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-card-foreground font-medium">{item.value}</p>
            </div>
          ))}

          <div className="mt-8 space-y-4">
            <button
              onClick={() => window.location.href = '/payment/upload-slip'}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 px-4 hover:bg-opacity-90 transition-all duration-200"
            >
              Upload Payment Slip
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-secondary text-secondary-foreground rounded-lg py-3 px-4 hover:bg-opacity-90 transition-all duration-200"
            >
              Back to Homepage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}