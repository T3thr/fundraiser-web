// @/backend/services/NotificationService.ts
interface NotificationDetails {
    studentId: string;
    amount: number;
    sessionId: string;
    additionalInfo?: Record<string, any>;
  }
  
  export class NotificationService {
    static async sendPaymentInitiatedNotification(details: NotificationDetails) {
      // Implement notification logic (email, SMS, etc.)
      console.log('Payment initiated notification:', details);
    }
  
    static async sendPaymentSuccessNotification(details: NotificationDetails) {
      // Implement notification logic
      console.log('Payment success notification:', details);
    }
  
    static async sendPaymentFailedNotification(details: NotificationDetails) {
      // Implement notification logic
      console.log('Payment failed notification:', details);
    }
  }