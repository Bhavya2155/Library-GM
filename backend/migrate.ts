import Database from 'better-sqlite3';
import prisma from './src/lib/db';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const sqlitePath = path.resolve(__dirname, '../library.db');
const sqlite = new Database(sqlitePath);

async function migrate() {
  console.log('Starting migration to Turso...');

  try {
    // 1. Migrate Admins
    console.log('Migrating admins...');
    const admins = sqlite.prepare('SELECT * FROM admins').all() as any[];
    for (const admin of admins) {
      await prisma.admin.upsert({
        where: { id: admin.id },
        update: {},
        create: {
          id: admin.id,
          username: admin.username,
          password: admin.password,
          role: admin.role,
        }
      });
    }

    // 2. Migrate Books
    console.log('Migrating books...');
    const books = sqlite.prepare('SELECT * FROM books').all() as any[];
    for (const book of books) {
      await prisma.book.upsert({
        where: { id: book.id },
        update: {},
        create: {
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          category: book.category,
          quantity: book.quantity,
          availableCopies: book.availableCopies,
          createdAt: new Date(book.createdAt),
        }
      });
    }

    // 3. Migrate Students
    console.log('Migrating students...');
    const students = sqlite.prepare('SELECT * FROM students').all() as any[];
    for (const student of students) {
      await prisma.student.upsert({
        where: { id: student.id },
        update: {},
        create: {
          id: student.id,
          name: student.name,
          studentId: student.studentId,
          email: student.email,
          phone: student.phone,
          createdAt: new Date(student.createdAt),
        }
      });
    }

    // 4. Migrate Guests
    console.log('Migrating guests...');
    const guests = sqlite.prepare('SELECT * FROM guests').all() as any[];
    for (const guest of guests) {
      await prisma.guest.upsert({
        where: { id: guest.id },
        update: {},
        create: {
          id: guest.id,
          name: guest.name,
        }
      });
    }

    // 5. Migrate Login History
    console.log('Migrating login history...');
    const loginHistory = sqlite.prepare('SELECT * FROM login_history').all() as any[];
    for (const log of loginHistory) {
      await prisma.loginHistory.upsert({
        where: { id: log.id },
        update: {},
        create: {
          id: log.id,
          username: log.username || 'Unknown',
          role: log.role || 'Unknown',
          loginTime: new Date(log.loginTime),
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
        }
      });
    }

    // 6. Migrate Issued Books
    console.log('Migrating issued books (circulation)...');
    const issuedBooks = sqlite.prepare('SELECT * FROM issued_books').all() as any[];
    for (const issue of issuedBooks) {
      await prisma.issuedBook.upsert({
        where: { id: issue.id },
        update: {},
        create: {
          id: issue.id,
          bookId: issue.bookId,
          studentId: issue.studentId,
          guestId: issue.guestId,
          issueDate: new Date(issue.issueDate),
          dueDate: issue.dueDate ? new Date(issue.dueDate) : null,
          returnDate: issue.returnDate ? new Date(issue.returnDate) : null,
          renewDate: issue.renewDate ? new Date(issue.renewDate) : null,
          status: issue.status,
          renewals: issue.renewals,
          issuedBy: issue.issuedBy,
        }
      });
    }

    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

migrate();
