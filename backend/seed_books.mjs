import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(fs.readFileSync('./books_data.json', 'utf8'));
  console.log(`Loaded ${data.length} books. Inserting...`);
  
  // Clean string function
  const clean = (s) => s ? String(s).replace(/\n/g, ' ').trim() : '';
  
  let success = 0;
  let failed = 0;
  
  for (let b of data) {
    try {
      await prisma.book.create({
        data: {
          isbn: clean(b.isbn),
          title: clean(b.title),
          author: clean(b.author),
          language: clean(b.language),
          category: clean(b.category),
          quantity: 1,
          availableCopies: 1
        }
      });
      success++;
    } catch (e) {
      if (e.code === 'P2002') {
         // ISBN exists
         failed++;
      } else {
         console.error('Failed on', b.isbn, e.message);
         failed++;
      }
    }
    if (success % 100 === 0) console.log(`Inserted ${success} books...`);
  }
  
  console.log(`Finished! Success: ${success}, Failed: ${failed}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
