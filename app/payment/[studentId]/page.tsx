// app/payment/[studentId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import QRCode from 'qrcode.react';

interface PaymentDetails {
  student: {
    name: string;
    studentId: string;
  };
  amount: number;
  month: string;
}

export default function PaymentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed'>('pending');

  const studentId = params.studentId;
  const month = searchParams.get('month');

  useEffect(() => {
    fetchPaymentDetails();
    if (paymentStatus === 'pending') {
      // Start polling for payment status
      const interval = setInterval(checkPaymentStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [studentId, month, paymentStatus]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/payment-details/${studentId}?month=${month}`);
      const data = await response.json();
      setPaymentDetails(data);
    } catch (error) {
      console.error('Error fetching payment details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payment-status/${studentId}?month=${month}`);
      const { status } = await response.json();
      
      if (status === 'completed') {
        setPaymentStatus('completed');
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Payment Details</h1>
        
        {paymentDetails && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600">Student Name</p>
              <p className="font-semibold">{paymentDetails.student.name}</p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600">Amount</p>
              <p className="font-semibold text-2xl">฿{paymentDetails.amount}</p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600">Month</p>
              <p className="font-semibold">{paymentDetails.month}</p>
            </div>
            
            <div className="flex justify-center py-4">
              <QRCode 
                value={`https://promptpay.io/${process.env.NEXT_PUBLIC_PROMPTPAY_ID}/${paymentDetails.amount}`}
                size={200}
                level="H"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Scan QR code with any mobile banking app to pay
              </p>
            </div>

            {paymentStatus === 'completed' && (
              <div className="text-center text-green-500 font-semibold">
                Payment completed! Redirecting...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}