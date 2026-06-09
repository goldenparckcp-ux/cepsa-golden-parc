import { NextResponse } from 'next/server';
// @ts-ignore
import { Client } from 'pg';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  if (key !== 'supersecretmigrationkey123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  // Use the raw IPv6 address directly as host
  const client = new Client({
    host: '2a05:d018:65a:e202:51ae:29f1:5502:5fd',
    port: 5432,
    user: 'postgres',
    password: 'EgBovcTTPMqZga5W',
    database: 'postgres',
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
      direct_ipv6: true,
      columns: columns.rows
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
