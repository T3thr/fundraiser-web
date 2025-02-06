// @/utils/payment.ts
export const calculateFee = (monthName: string, year: number): number => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
  
    const monthMap: { [key: string]: number } = {
      'january': 0, 'february': 1, 'march': 2, 'april': 3,
      'may': 4, 'june': 5, 'july': 6, 'august': 7,
      'september': 8, 'october': 9, 'november': 10, 'december': 11
    };
  
    const paymentMonth = monthMap[monthName.toLowerCase()];
    return (currentYear < year || (currentYear === year && currentMonth <= paymentMonth)) ? 70 : 80;
  };