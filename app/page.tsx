import { Suspense } from 'react';
import Student from '@/components/Student';
import { sheetsService } from '@/backend/lib/googleSheets';
import { Loader2, ExternalLink, Mail, MessageCircle, Facebook } from 'lucide-react';

async function getStudentData() {
  try {
    return await sheetsService.getStudents();
  } catch (error) {
    console.error('Error fetching student data:', error);
    return [];
  }
}

export default async function Home() {
  const students = await getStudentData();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
        CPE NU Fundraiser Payment Dashboard
      </h1>
      <Suspense
        fallback={
          <div className="flex justify-center items-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        }
      >
        <Student
          students={students}
          onPaymentInitiate={async (month, studentId) => {
            'use server';
            console.log(`Payment initiated for student ${studentId} for ${month}`);
          }}
        />
      </Suspense>

      {/* Go to Google Sheet Button */}
      <div className="mt-8 flex justify-center">
        <a
          href={process.env.NEXT_PUBLIC_GOOGLE_SHEET_URL || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-6 py-3 bg-secondary text-foreground rounded-lg hover:text-foreground transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 group"
        >
          <ExternalLink className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
          <span className="font-medium">ติดตามความเคลื่อนไหวบัญชี</span>
        </a>
      </div>

      {/* Contact Developer Section */}
      <div className="mt-12 text-center bg-gradient-to-br from-primary/10 to-secondary/10 p-8 rounded-xl border border-border/20 shadow-lg backdrop-blur-sm">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Contact Developer
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          พบเจอปัญหาอะไร ติดต่อผู้พัฒนาผ่านช่องทางข้างล่างนี้ เช่น ต้องการจ่ายเหมา ยอดเงินไม่อัพเดท ฯลฯ
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Email */}
          <a
            href="mailto:theerapatpo66@nu.ac.th"
            className="flex flex-col items-center justify-center p-6 bg-card text-foreground rounded-lg hover:bg-card/80 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 group"
          >
            <Mail className="w-8 h-8 mb-4 text-primary group-hover:text-primary/80 transition-colors duration-300" />
            <span className="font-medium">Email</span>
            <span className="text-sm text-muted-foreground">theerapatpo66@nu.ac.th</span>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/t3rapat/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-6 bg-card text-foreground rounded-lg hover:bg-card/80 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 group"
          >
            <Facebook className="w-8 h-8 mb-4 text-primary group-hover:text-primary/80 transition-colors duration-300" />
            <span className="font-medium">Facebook</span>
            <span className="text-sm text-muted-foreground">Theerapat Pooraya</span>
          </a>

          {/* Line */}
          <a
            href="https://line.me/ti/p/~testicle_123"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-6 bg-card text-foreground rounded-lg hover:bg-card/80 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 group"
          >
            <MessageCircle className="w-8 h-8 mb-4 text-primary group-hover:text-primary/80 transition-colors duration-300" />
            <span className="font-medium">Line</span>
            <span className="text-sm text-muted-foreground">Add By QR Code</span>
          </a>

        </div>
      </div>
    </div>
  );
}