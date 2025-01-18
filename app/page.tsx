// app/page.tsx
'use client';
import { Suspense } from 'react';
import StudentTable from '@/components/StudentTable';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Class Fundraising System</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <StudentTable />
        </Suspense>
      </div>
    </main>
  );
}