require('dotenv').config();
const bcrypt = require('bcryptjs');

async function check() {
  const hashMangesh = '$2b$10$c2sSN6sjj10q3HNf7/wSzO0OwgMe3.EildCA5SbMmi72xA7jdUi7O';
  const hashDada = '$2b$10$h2yJVcDHCrHxaTE69vu7xOv/Wyy9.en.jxU8fej9XaDxWNf6kEr8q';
  
  const passwordsToTest = ['Mangeshbhai123', 'admin123', 'password', 'Dada1234', 'mangesh', 'admin'];
  
  for (const p of passwordsToTest) {
    if (await bcrypt.compare(p, hashMangesh)) console.log(`Mangeshbhai is ${p}`);
    if (await bcrypt.compare(p, hashDada)) console.log(`Dada is ${p}`);
  }
}

check();
