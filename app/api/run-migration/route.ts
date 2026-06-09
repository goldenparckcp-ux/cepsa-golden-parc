import { NextResponse } from 'next/server';
// @ts-ignore
import { Client } from 'pg';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (key !== 'supersecretmigrationkey123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use the IPv4 pooler connection string
  const connectionString = 'postgresql://postgres.vktqecgylkjogquhsymz:EgBovcTTPMqZga5W@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require';
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    
    // Check current columns
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'restaurant_orders' 
        AND column_name IN ('deposit_amount', 'deposit_paid', 'payment_intent_id');
    `);

    await client.end();
    return NextResponse.json({
      success: true,
      columns: columns.rows
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
