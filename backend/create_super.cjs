const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

const client = createClient({
  url: 'libsql://library-db-bhavya2155.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYzMzYwOTEsImlkIjoiMDE5ZmU5ZWMtZDYwMS03MmM1LTg2MzgtYzNmMWE1Yzk4ZjVjIiwia2lkIjoiYWNfdFc3alhkVG15RENqTWF4T2FqaWt1UHpucTZ3OGh4dEhYQk01U1JPMCIsInJpZCI6ImY0ZjIyZmYwLTQ4MzUtNDU5NS1hMjE1LTQ1YzFkZWVlYTVmNSJ9.XEPAis4H7r9jUE1H8cNcscE75yxn8o0eF6t4fiFr7XvPkY9hoIKmQxoQ5E_Nuhnh8nOjaqlNA8OVryTPA489Dw'
});

async function main() {
  // Check if admin already exists
  const existing = await client.execute("SELECT id, username FROM admins WHERE username = 'admin'");
  if (existing.rows.length > 0) {
    console.log('admin account already exists');
    return;
  }

  const hash = await bcrypt.hash('admin123', 10);
  await client.execute({
    sql: "INSERT INTO admins (username, password, role) VALUES (?, ?, ?)",
    args: ['admin', hash, 'admin']
  });
  console.log('Super coordinator account created: admin / admin123');
}
main().catch(console.error);
