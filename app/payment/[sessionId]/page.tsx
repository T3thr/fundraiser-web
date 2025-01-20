// @/app/payment/[sessionId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PaymentPage() {
  const { sessionId } = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe failed to initialize');

        const { error } = await stripe.redirectToCheckout({
          sessionId: sessionId as string,
        });

        if (error) {
          console.error('Payment error:', error);
          setStatus('error');
        }
      } catch (error) {
        console.error('Payment initialization error:', error);
        setStatus('error');
      }
    };

    initializePayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === 'loading' && <div>Preparing payment...</div>}
      {status === 'error' && <div>Payment failed. Please try again.</div>}
      {status === 'success' && <div>ขอบคุณที่ชำระเงิน.</div>}
    </div>
  );
}