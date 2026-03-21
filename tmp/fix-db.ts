import { neon } from '@neondatabase/serverless';

const sql = neon("postgresql://neondb_owner:npg_OZYigu5rbT9o@ep-delicate-forest-anu2ju7g-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require");

async function fix() {
  console.log("Fixing debts table...");
  try {
    // Add missing columns if they don't exist
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS interest_rate NUMERIC(5, 2) DEFAULT '0'`;
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS period INTEGER DEFAULT 0`;
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS processing_fee NUMERIC(12, 2) DEFAULT '0'`;
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS start_date TIMESTAMP DEFAULT NOW()`;
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS weight NUMERIC(10, 3)`;
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS purity TEXT`;
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS is_gold_loan BOOLEAN DEFAULT FALSE`;
    
    console.log("Successfully added columns to debts table.");
  } catch (error) {
    console.error("Error fixing debts table:", error);
  }
}

fix();
