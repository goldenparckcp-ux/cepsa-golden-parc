import { NextResponse } from 'next/server';
// @ts-ignore
import { Client } from 'pg';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (key !== 'supersecretmigrationkey123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const connectionString = 'postgresql://postgres:EgBovcTTPMqZga5W@db.vktqecgylkjogquhsymz.supabase.co:5432/postgres';
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    // Check current columns
    const initialColumns = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'restaurant_orders';
    `);

    // Run migration
    await client.query(`
      ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0;
      ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;
      ALTER TABLE public.restaurant_orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
      NOTIFY pgrst, 'reload schema';
    `);

    // Check columns again
    const finalColumns = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'restaurant_orders';
    `);

    await client.end();
    return NextResponse.json({
      success: true,
      initial: initialColumns.rows.map((r: any) => r.column_name),
      final: finalColumns.rows.map((r: any) => r.column_name)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
