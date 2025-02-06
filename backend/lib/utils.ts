// app/lib/utils.ts
export function getCurrentMonth(): string {
  return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      year: 'numeric' 
  }).format(new Date());
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
  }).format(amount);
} 