// @/components/ui/icons/PaymentIcon.tsx
import React from 'react';

export const SuccessIcon = () => (
  <div className="h-24 w-24 relative animate-success-circle">
    <div className="absolute inset-0 border-4 border-green-500 rounded-full"></div>
    <svg
      className="absolute inset-0 h-24 w-24 text-green-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M5 13l4 4L19 7"
        className="animate-success-check"
      />
    </svg>
  </div>
);