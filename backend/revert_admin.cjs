const { createClient } = require('@libsql/client');

const client = createClient({
  url: 'libsql://library-db-bhavya2155.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODYzMzYwOTEsImlkIjoiMDE5ZmU5ZWMtZDYwMS03MmM1LTg2MzgtYzNmMWE1Yzk4ZjVjIiwia2lkIjoiYWNfdFc3alhkVG15RENqTWF4T2FqaWt1UHpucTZ3OGh4dEhYQk01U1JPMCIsInJpZCI6ImY0ZjIyZmYwLTQ4MzUtNDU5NS1hMjE1LTQ1YzFkZWVlYTVmNSJ9.XEPAis4H7r9jUE1H8cNcscE75yxn8o0eF6t4fiFr7XvPkY9hoIKmQxoQ5E_Nuhnh8nOjaqlNA8OVryTPA489Dw'
});

async function main() {
  await client.execute({
    sql: "UPDATE admins SET username = 'admin' WHERE username = 'coordinator' AND role = 'admin'",
    args: []
  });
  console.log('Username changed back to admin');
  
  // Verify
  const result = await client.execute("SELECT id, username, role FROM admins WHERE role = 'admin'");
  console.log('Admin accounts:', JSON.stringify(result.rows, null, 2));
}
main().catch(console.error);
