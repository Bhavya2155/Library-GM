import mongoose from 'mongoose';

const issuedBookSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  issueDate: { type: Date, default: Date.now },
  returnDate: { type: Date },
  status: { type: String, enum: ['issued', 'returned'], default: 'issued' }
}, { timestamps: true });

export default mongoose.model('IssuedBook', issuedBookSchema);
