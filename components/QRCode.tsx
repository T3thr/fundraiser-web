// app/components/QRCode.tsx
'use client';

export default function QRCode() {
  return (
    <div className="border-4 border-gray-200 rounded-lg p-4">
      <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
        {/* Placeholder for actual QR code */}
        <div className="text-gray-400 text-center">
          <p>QR Code Placeholder</p>
          <p className="text-sm mt-2">Will be replaced with actual PromptPay QR</p>
        </div>
      </div>
    </div>
  );
}