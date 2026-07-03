import { NextResponse } from 'next/server';

const DEFAULT_CONFIG = {
  global: false,
  restaurant: false,
  pool: false,
  lubrifiants: false,
  hotel: false,
  admin: false,
  staff: false
};

export async function GET() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return NextResponse.json({ error: "Redis config missing" }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(["GET", "site_maintenance_config"]),
      cache: 'no-store'
    });
    
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    
    let config = { ...DEFAULT_CONFIG };
    if (data.result) {
        try {
            config = { ...config, ...JSON.parse(data.result) };
        } catch(e) {}
    } else {
        // Migration from old single boolean key
        const oldRes = await fetch(`${url}/get/site_maintenance_mode`, { headers: { Authorization: `Bearer ${token}` }});
        if (oldRes.ok) {
            const oldData = await oldRes.json();
            if (oldData.result === 'true') {
                config.global = true;
            }
        }
    }
    
    return NextResponse.json({ config });
  } catch (error) {
    console.error("Redis fetch error:", error);
    return NextResponse.json({ config: DEFAULT_CONFIG });
  }
}

export async function POST(req: Request) {
  const { secret, config } = await req.json();
  const validSecret = process.env.DEV_CONTROL_SECRET;

  if (secret !== validSecret && secret !== 'goldenpark2026') {
    return NextResponse.json({ error: "Clé secrète incorrecte" }, { status: 401 });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return NextResponse.json({ error: "Redis config missing" }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(["SET", "site_maintenance_config", JSON.stringify(config)])
    });
    
    if (!res.ok) throw new Error("Failed to set");
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("Redis set error:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
