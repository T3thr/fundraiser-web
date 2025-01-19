import { Suspense } from 'react';
import Student from '@/components/Student';
import { sheetsService } from '@/backend/lib/googleSheets';
import { Loader2 } from 'lucide-react';

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
    </div>
  );
}
