import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  month: String,
  year: Number,
  status: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  },
  paymentDate: Date,
  amount: Number,
  transactionId: String
});

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  payments: [paymentSchema]
}, {
  timestamps: true
});

export default mongoose.models.Student || mongoose.model('Student', studentSchema);