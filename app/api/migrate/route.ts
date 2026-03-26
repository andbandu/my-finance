import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  const connectionString = process.env.DATABASE_URL!;
  const sql = neon(connectionString);
  
  try {
    console.log("Adding asset_id column to transactions...");
    await sql(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS asset_id integer;`);
    
    try {
      await sql(`ALTER TABLE transactions ADD CONSTRAINT transactions_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE;`);
    } catch(e) {
      console.log("FKey error (might exist):", e);
    }
    
    return NextResponse.json({ success: true, message: "Asset ID column added" });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
