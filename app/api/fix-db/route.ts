import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log("Fixing debts table via API...");
    
    // Add missing columns if they don't exist
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS interest_rate NUMERIC(5, 2) DEFAULT '0'`;
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS period INTEGER DEFAULT 0`;
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS processing_fee NUMERIC(12, 2) DEFAULT '0'`;
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS start_date TIMESTAMP DEFAULT NOW()`;
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS weight NUMERIC(10, 3)`;
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS purity TEXT`;
    await sql`ALTER TABLE debts ADD COLUMN IF NOT EXISTS is_gold_loan BOOLEAN DEFAULT FALSE`;
    
    return NextResponse.json({ success: true, message: "Successfully added columns to debts table." });
  } catch (error: any) {
    console.error("Error fixing debts table:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
