// @/components/PaymentMethodSelector.tsx
import React from 'react';
//import Image from 'next/image';
import { PaymentMethod } from '@/types/payment';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodSelect: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ selectedMethod, onMethodSelect }: PaymentMethodSelectorProps) {
  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'promptpay', name: 'PromptPay', icon: '📱' },
    // { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
    // { id: 'truemoney', name: 'TrueMoney Wallet', icon: '👝' },
    // { id: 'rabbit_linepay', name: 'Rabbit LINE Pay', icon: '🐰' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {paymentMethods.map((method) => (
        <button
          key={method.id}
          onClick={() => onMethodSelect(method.id as PaymentMethod)}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedMethod === method.id
              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900'
              : 'border-gray-200 hover:border-indigo-400 dark:border-gray-700'
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{method.icon}</span>
            <span className="font-medium">{method.name}</span>
          </div>
        </button>
      ))}
    </div>
  );
}