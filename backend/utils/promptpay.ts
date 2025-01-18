export async function generatePromptPayQR(amount: number): Promise<string> {
    // TODO: Implement actual PromptPay QR code generation
    // For now, return a placeholder
    return `promptpay-qr-${amount}`;
}

export async function verifyPromptPayPayment(paymentId: string): Promise<boolean> {
    // TODO: Implement actual PromptPay payment verification
    // For now, return a placeholder response
    return true;
} 