import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return NextResponse.json({ error: "Redis config missing" }, { status: 500 });
  }

  try {
    const res = await fetch(`${url}/get/site_maintenance_mode`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store'
    });
    
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    const isMaintenance = data.result === "true";
    
    return NextResponse.json({ isMaintenance });
  } catch (error) {
    console.error("Redis fetch error:", error);
    return NextResponse.json({ isMaintenance: false }); // default safe
  }
}

export async function POST(req: Request) {
  const { secret, isMaintenance } = await req.json();
  const validSecret = process.env.DEV_CONTROL_SECRET || 'goldenpark2026';

  if (secret !== validSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return NextResponse.json({ error: "Redis config missing" }, { status: 500 });
  }

  try {
    const res = await fetch(`${url}/set/site_maintenance_mode/${isMaintenance ? 'true' : 'false'}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!res.ok) throw new Error("Failed to set");
    return NextResponse.json({ success: true, isMaintenance });
  } catch (error) {
    console.error("Redis set error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
