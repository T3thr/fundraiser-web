// app/api/students/route.ts
import { NextResponse } from 'next/server';
import mongodbConnect from '@/backend/lib/mongodb';
import Student from '@/backend/models/Student';

export async function GET() {
  try {
    await mongodbConnect();
    const students = await Student.find({});
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await mongodbConnect();
    const student = await Student.create(body);
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}