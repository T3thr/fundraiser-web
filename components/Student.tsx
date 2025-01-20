'use client';

import React, { useState } from 'react';
import { StudentData } from '@/backend/lib/googleSheets';
import SearchBar from './SearchBar';
import PaymentButton from './PaymentButton';

interface StudentProps {
  students: StudentData[];
  onPaymentInitiate: (month: string, studentId: string) => Promise<void>;
}

export default function Student({ students }: StudentProps) {
  const [filteredStudents, setFilteredStudents] = useState(students);

  const months = [
    { name: 'July', year: 2024 },
    { name: 'August', year: 2024 },
    { name: 'September', year: 2024 },
    { name: 'October', year: 2024 },
    { name: 'November', year: 2024 },
    { name: 'December', year: 2024 },
    { name: 'January', year: 2025 },
    { name: 'February', year: 2025 },
    { name: 'March', year: 2025 },
  ];

  const handleSearch = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(lowerQuery) ||
        student.id.toLowerCase().includes(lowerQuery)
    );
    setFilteredStudents(filtered);
  };

  const formatPaymentStatus = (value: string | undefined, studentId: string, month: string, year: number, rowNumber: number) => {
    if (!rowNumber) {
      return <span className="font-medium">{value}</span>;
    }

    const amount = parseInt(value || '0') || 0;
    const isOverdue = amount === 0;

    if (!value) {
      return null;
    }

    return (
      <PaymentButton
        amount={amount}
        studentId={studentId}
        month={month}
        year={year}
        isOverdue={isOverdue}
      />
    );
  };

  return (
    <div className="bg-gradient-to-br bg-background">
      <SearchBar onSearch={handleSearch} />
      <div className="-p-6 overflow-x-auto rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="min-w-full text-sm text-gray-800 dark:text-gray-200">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-800 to-indigo-900 dark:from-gray-900 dark:to-gray-800 text-white">
              <th className="p-4 text-left border-r-2 border-indigo-300 dark:border-indigo-900" colSpan={4}>Information</th>
              <th className="p-4 text-center border-r-2 border-indigo-300 dark:border-indigo-900" colSpan={9}>Monthly Payments</th>
              <th className="p-4 text-center border-indigo-300">Status</th>
            </tr>
          </thead>
          <thead>
            <tr className="bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs uppercase sticky -top-3 pt-20 z-30">
              <th className="p-4 text-center">No.</th>
              <th className="p-4 pr-40 text-left">Name</th>
              <th className="p-4 -pr-6 text-left sticky left-0 bg-indigo-100 dark:bg-indigo-900 z-10">Nickname</th>
              <th className="p-4 text-left">Student ID</th>
              {months.map(({ name, year }) => (
                <th key={`${name}-${year}`} className="p-4 text-center">
                  {`${name.slice(0, 3)} ${year}`}
                </th>
              ))}
              <th className="p-4 text-center">Note</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student, index) => (
              <tr
                key={student.id}
                className={`border-b border-gray-200 dark:border-gray-700 transition-colors ${
                  index % 2 === 0
                    ? 'bg-gray-50 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900'
                    : 'bg-white dark:bg-gray-900 hover:bg-indigo-100 dark:hover:bg-indigo-900'
                }`}
              >
                <td className="p-4 text-center font-medium">{student.no}</td>
                <td className="p-4">{student.name}</td>
                <td className={`p-4 sticky left-0 z-10 ${index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900' : 'bg-white dark:bg-gray-900 hover:bg-indigo-100 dark:hover:bg-indigo-900'}`}>{student.nickname}</td>
                <td className="p-4">{student.id}</td>
                {months.map(({ name, year }) => (
                  <td key={`${student.id}-${name}`} className="p-4 text-center">
                    {typeof student[name.toLowerCase().slice(0, 3) as keyof StudentData] === 'string' &&
                      formatPaymentStatus(
                        student[name.toLowerCase().slice(0, 3) as keyof StudentData] as string,
                        student.id,
                        name,
                        year,
                        parseInt(student.no)
                      )}
                  </td>
                ))}
                <td className="p-4 text-left">{student.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}