// app/lib/utils.ts
export function getCurrentMonth(): string {
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());
  }
  