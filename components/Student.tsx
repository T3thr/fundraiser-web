'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StudentData } from '@/backend/lib/googleSheets';
import SearchBar from './SearchBar';

interface StudentProps {
  students: StudentData[];
  onPaymentInitiate: (month: string, studentId: string) => Promise<void>;
}

export default function Student({ students, onPaymentInitiate }: StudentProps) {
  const [filteredStudents, setFilteredStudents] = useState(students);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
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

  return (
    <div className="p-4">
      <SearchBar onSearch={handleSearch} />
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left bg-card text-card-foreground">
          <thead className="text-xs uppercase bg-muted text-muted-foreground rounded-lg sticky top-0 z-10">
            <tr>
              <th className="p-4">No.</th>
              <th className="p-4">Student ID</th>
              <th className="p-4">Name</th>
              {months.map((month) => (
                <th key={month} className="p-4 text-center">
                  {month.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr
                key={student.id}
                className="border-b border-border hover:bg-muted transition-colors"
              >
                <td className="p-4 font-medium text-foreground">{student.no}</td>
                <td className="p-4 text-foreground">{student.id}</td>
                <td className="p-4 text-foreground">{student.name}</td>
                {months.map((month) => (
                  <td key={month} className="p-4 text-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="flex justify-center"
                    >
                      <button
                        onClick={() => onPaymentInitiate(month, student.id)}
                        className="flex items-center gap-2 px-3 py-1 bg-destructive text-xs font-medium text-primary-foreground rounded-full hover:bg-opacity-90 transition-colors duration-200"
                        aria-label={`Pay ${month} for ${student.name}`}
                      >
                        Pay Now
                      </button>
                    </motion.div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
