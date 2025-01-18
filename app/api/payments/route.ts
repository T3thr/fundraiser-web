// app/api/payment/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/mongodb';
import { Student } from '@/backend/models/Student';
import { getCurrentMonth } from '@/backend/lib/utils';

export async function POST(request: Request) {
  await connectDB();
  const { studentId } = await request.json();
  const currentMonth = getCurrentMonth();
  
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const student = await Student.findById(studentId);
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }
  
  student.paymentStatus.set(currentMonth, 'paid');
  await student.save();
  
  return NextResponse.json({ success: true });
}
