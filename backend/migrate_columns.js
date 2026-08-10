const { createClient } = require('@libsql/client');

async function main() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!url || url.includes('dev.db')) {
    console.log("No remote DATABASE_URL provided. Skipping migration.");
    return;
  }

  const client = createClient({ url, authToken });
  
  try {
    console.log("Adding ipAddress column...");
    await client.execute('ALTER TABLE login_history ADD COLUMN ipAddress TEXT;');
    console.log("Added ipAddress.");
  } catch (err) {
    console.log("ipAddress might already exist: " + err.message);
  }

  try {
    console.log("Adding userAgent column...");
    await client.execute('ALTER TABLE login_history ADD COLUMN userAgent TEXT;');
    console.log("Added userAgent.");
  } catch (err) {
    console.log("userAgent might already exist: " + err.message);
  }

  console.log("Migration finished.");
}

main();
