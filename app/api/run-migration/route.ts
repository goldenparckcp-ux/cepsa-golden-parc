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

  const regions = [
    'eu-central-1',
    'eu-west-1',
    'eu-west-2',
    'eu-west-3',
    'us-east-1',
    'us-east-2',
    'us-west-1',
    'us-west-2',
    'ap-southeast-1',
    'ap-southeast-2',
    'ap-northeast-1',
    'ap-northeast-2',
    'ca-central-1',
    'sa-east-1',
    'ap-south-1'
  ];

  const results: Record<string, string> = {};

  for (const region of regions) {
    const connectionString = `postgresql://postgres.vktqecgylkjogquhsymz:EgBovcTTPMqZga5W@aws-0-${region}.pooler.supabase.com:6543/postgres`;
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      // Set a short timeout for the connection
      await Promise.race([
        client.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 4s')), 4000))
      ]);
      results[region] = 'SUCCESS';
      await client.end();
      // If we find the correct region, we can stop early!
      break;
    } catch (error: any) {
      results[region] = error.message;
      try {
        await client.end();
      } catch (e) {}
    }
  }

  return NextResponse.json({
    success: true,
    results
  });
}
