// @/lib/promptpay.ts
interface PromptPayOptions {
    number: string;
    amount: number;
  }
  
  export function generatePromptPayQR({ number, amount }: PromptPayOptions): string {
    // This is a simplified version. You should use a proper PromptPay QR library
    const promptPayData = `00020101021129370016A000000677010111011300669183849765802TH53037646304DFE3`;
    return promptPayData;
  }
  