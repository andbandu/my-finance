import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_OZYigu5rbT9o@ep-delicate-forest-anu2ju7g-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require");

async function main() {
  console.log("Creating assets table...");
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        ledger_id INTEGER NOT NULL REFERENCES ledgers(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity NUMERIC(12, 4) NOT NULL,
        purchase_price NUMERIC(12, 2),
        current_price NUMERIC(12, 2),
        date TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log("Success!");
  } catch (e) {
    console.error("Error creating table:", e);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
