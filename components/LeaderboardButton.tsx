'use client'
import React, { useState, useMemo, useEffect } from 'react';
import { StudentData } from '@/backend/lib/googleSheets';
import { Medal } from 'lucide-react';

const LeaderboardButton = ({ students }: { students: StudentData[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const handleMouseEnter = () => {
      setIsButtonVisible(true);
      clearTimeout(timeoutId);
    };
    
    const handleMouseLeave = () => {
      timeoutId = setTimeout(() => setIsButtonVisible(false), 3000);
    };
    
    const button = document.getElementById('leaderboard-button');
    
    if (button) {
      button.addEventListener('mouseenter', handleMouseEnter);
      button.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      clearTimeout(timeoutId);
      if (button) {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  const leaderboardData = useMemo(() => {
    const monthKeys = ['jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar'];
    return students
      .map(student => {
        const exact70Payments = monthKeys.reduce((count, month) =>
          count + (student[month as keyof StudentData] === '70' ? 1 : 0), 0);

        const totalPayment = monthKeys.reduce((total, month) =>
          total + parseInt(student[month as keyof StudentData]?.toString() || '0', 10), 0);

        return {
          id: student.id,
          name: student.name,
          nickname: student.nickname,
          exact70Payments,
          totalMonthsPaid: Math.floor(totalPayment / 70),
          totalAmount: totalPayment
        };
      })
      .sort((a, b) => b.exact70Payments - a.exact70Payments || b.totalMonthsPaid - a.totalMonthsPaid)
      .slice(0, 10);
  }, [students]);

  return (
    <div className="relative">
      <button
        id="leaderboard-button"
        onClick={() => setIsOpen(true)}
        className={`mb-4 flex items-center space-x-2 bg-gradient-to-r from-rose-400 to-purple-400 dark:from-rose-900 dark:to-purple-900 text-white px-24 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group z-40 ${
          isButtonVisible ? 'opacity-100' : 'opacity-75'
        }`}
      >
        <Medal className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
        <span className="font-semibold">Leaderboard</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full mx-4 shadow-2xl overflow-hidden relative">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative z-10"
              style={{
                backgroundImage: 'url(https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExazg2dXF0YnJ5ZTBlc21jcHN4cmh4cXBpZjNtMHFrcXZ5Y2NieXc2eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/GNvWw0pDL6QRW/giphy.gif)', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="flex justify-between items-center relative z-10">
                <h3 className="text-2xl font-bold">HALL OF FAME</h3>
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors" aria-label='openleaderboard'>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-white mt-2 relative z-10">10 อันดับสกิบิดี้ทอยเล็ตตัวน้อย ที่มีวินัยทางการเงินดีที่สุด</p>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto relative z-10">
              {leaderboardData.map((student, index) => (
                <div key={student.id} className="flex items-center space-x-4 p-4 rounded-xl mb-3 bg-gray-100 dark:bg-gray-700 hover:shadow-md transition-all">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                    {index <= 2 ? <Medal className="w-6 h-6" /> : <span>{index + 1}</span>}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{student.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{student.nickname}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">จ่ายตรงเวลา {student.exact70Payments} ครั้ง</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{student.totalMonthsPaid} เดือน ({student.totalAmount} ฿)</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                คิดจากจำนวนยอดเงิน 70฿ ทั้งหมดของคนๆนั้น
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardButton;