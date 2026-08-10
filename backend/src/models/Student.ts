import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);
