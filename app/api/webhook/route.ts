// app/api/webhook/route.ts
import { NextResponse } from 'next/server'
import { MongoClient, ObjectId } from 'mongodb'

export async function POST(request: Request) {
  try {
    const { reference, status, amount } = await request.json()
    
    if (status === 'success') {
      // Extract student ID from reference
      const studentId = reference.split('-')[0]
      
      const client = new MongoClient(uri)
      await client.connect()
      const database = client.db('fundraising')
      const students = database.collection('students')
      
      const currentMonth = new Date().toLocaleString('default', { month: 'long' })
      
      await students.updateOne(
        { _id: new ObjectId(studentId) },
        { $set: { [`paymentStatus.${currentMonth}`]: 'paid' } }
      )
      
      await client.close()
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}