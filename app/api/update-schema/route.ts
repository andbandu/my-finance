import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log("Updating database schema via API...");
    
    // Add debt_id column if it doesn't exist
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS debt_id INTEGER REFERENCES debts(id) ON DELETE CASCADE`;
    
    // Add gold_price_24k column to ledgers if it doesn't exist
    await sql`ALTER TABLE ledgers ADD COLUMN IF NOT EXISTS gold_price_24k NUMERIC(12, 2)`;
    
    // Add purity column to assets if it doesn't exist
    await sql`ALTER TABLE assets ADD COLUMN IF NOT EXISTS purity NUMERIC(4, 1)`;
    
    // Create assets table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        ledger_id INTEGER NOT NULL REFERENCES ledgers(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        quantity NUMERIC(12, 4) NOT NULL,
        purchase_price NUMERIC(12, 2),
        current_price NUMERIC(12, 2),
        purity NUMERIC(4, 1),
        date TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    return NextResponse.json({ success: true, message: "Successfully updated schema and verified assets table." });
  } catch (error: any) {
    console.error("Error updating transactions table:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
