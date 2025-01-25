import React from 'react';
import { PaymentMethod } from '@/types/payment';
import { CheckCircle2, CreditCard, Smartphone } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onMethodSelect: (method: PaymentMethod) => void;
}

export default function PaymentMethodSelector({ 
  selectedMethod, 
  onMethodSelect 
}: PaymentMethodSelectorProps) {
  const paymentMethods = [
    { 
      id: 'card', 
      name: 'Credit/Debit Card', 
      icon: CreditCard,
      description: 'Pay instantly with your card' 
    },
    { 
      id: 'promptpay', 
      name: 'PromptPay', 
      icon: Smartphone,
      description: 'Quick mobile payment' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {paymentMethods.map((method) => {
        const Icon = method.icon;
        return (
          <button
            key={method.id}
            onClick={() => onMethodSelect(method.id as PaymentMethod)}
            className={`
              relative p-4 rounded-lg border-2 transition-all 
              flex items-center space-x-4
              ${selectedMethod === method.id 
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900' 
                : 'border-gray-200 hover:border-indigo-400 dark:border-gray-700'}
            `}
          >
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
              <Icon className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-left flex-grow">
              <h4 className="font-semibold">{method.name}</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {method.description}
              </p>
            </div>
            {selectedMethod === method.id && (
              <CheckCircle2 
                className="absolute top-2 right-2 text-indigo-600" 
                size={20} 
              />
            )}
          </button>
        );
      })}
    </div>
  );
}