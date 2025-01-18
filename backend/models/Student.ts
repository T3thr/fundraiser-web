// app/models/Student.ts
import mongoose, { Schema, Document } from 'mongoose';

interface IStudent extends Document {
  name: string;
  paymentStatus: {
    [key: string]: 'paid' | 'unpaid';
  };
}

const StudentSchema = new Schema({
  name: { type: String, required: true },
  paymentStatus: {
    type: Map,
    of: String,
    default: {}
  }
});

export const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
