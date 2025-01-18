// app/api/students/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/backend/lib/mongodb';
import { Student } from '@/backend/models/Student';

export async function GET() {
  await connectDB();
  const students = await Student.find({});
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  await connectDB();
  const data = await request.json();
  const student = new Student(data);
  await student.save();
  return NextResponse.json(student);
}

