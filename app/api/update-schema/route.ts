import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  const sql = neon(process.env.DATABASE_URL!);
  
  try {
    console.log("Updating transactions table via API...");
    
    // Add debt_id column if it doesn't exist
    await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS debt_id INTEGER REFERENCES debts(id) ON DELETE CASCADE`;
    
    return NextResponse.json({ success: true, message: "Successfully added debt_id to transactions table." });
  } catch (error: any) {
    console.error("Error updating transactions table:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
