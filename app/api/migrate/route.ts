import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log("Running migration via API...");
    await sql(`
      CREATE TABLE IF NOT EXISTS allocations (
        id SERIAL PRIMARY KEY,
        ledger_id INTEGER NOT NULL REFERENCES ledgers(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        category TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity NUMERIC(12, 2) DEFAULT '1',
        unit TEXT DEFAULT 'unit',
        target_day INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    return NextResponse.json({ success: true, message: "Allocations table ensured." });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
