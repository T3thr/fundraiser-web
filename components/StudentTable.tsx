// app/components/StudentTable.tsx
'use client';

import { useState, useEffect } from 'react';
import QRCode from './QRCode';

interface Student {
  _id: string;
  name: string;
  paymentStatus: {
    [key: string]: 'paid' | 'unpaid';
  };
}

export default function StudentTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showQR, setShowQR] = useState(false);
  const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    const response = await fetch('/api/students');
    const data = await response.json();
    setStudents(data);
  }

  async function handlePayment(student: Student) {
    setSelectedStudent(student);
    setShowQR(true);
  }

  async function processPayment() {
    if (!selectedStudent) return;
    
    try {
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudent._id }),
      });
      
      if (response.ok) {
        await fetchStudents();
        setShowQR(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Payment error:', error);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status ({currentMonth})
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => (
            <tr key={student._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {student.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  student.paymentStatus[currentMonth] === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.paymentStatus[currentMonth] || 'unpaid'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {student.paymentStatus[currentMonth] !== 'paid' && (
                  <button
                    onClick={() => handlePayment(student)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Pay Now
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showQR && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Scan QR Code to Pay</h2>
            <QRCode />
            <div className="mt-4 flex justify-end gap-4">
              <button
                onClick={() => setShowQR(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}