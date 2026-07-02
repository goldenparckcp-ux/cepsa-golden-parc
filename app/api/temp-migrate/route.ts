import { NextResponse } from 'next/server';
import { Client } from 'pg';

const connectionString = 'postgresql://postgres:EgBovcTTPMqZga5W@db.vktqecgylkjogquhsymz.supabase.co:5432/postgres';

export async function GET() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    
    const sql = `
      -- ==========================================
      -- STATION GALLERY (Homepage Marquee)
      -- ==========================================
      create table if not exists public.station_gallery (
        id uuid primary key default uuid_generate_v4(),
        image_url text not null,
        caption text not null,
        order_index int default 0,
        created_at timestamptz default now()
      );

      -- Enable RLS
      alter table public.station_gallery enable row level security;
      drop policy if exists "Public Usage" on public.station_gallery;
      create policy "Public Usage" on public.station_gallery for all using (true) with check (true);

      -- Insert Default Data (Default Unsplash Images from Home Page)
      insert into public.station_gallery (image_url, caption, order_index) values
      ('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80', 'Station Carburant', 0),
      ('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 'Hôtel L''Escale', 1),
      ('https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80', 'Piscine Privée', 2),
      ('https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80', 'Restaurant Beldi', 3),
      ('https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=800&q=80', 'Entretien & Lubrifiants', 4),
      ('https://images.unsplash.com/photo-1470723710355-95304d8aece4?auto=format&fit=crop&w=800&q=80', 'Espace Café & Repos', 5)
      on conflict do nothing;
    `;
    
    await client.query(sql);
    await client.end();
    
    return NextResponse.json({ success: true, message: 'Migration applied successfully.' });
  } catch (error: any) {
    console.error('Migration failed:', error);
    try { await client.end(); } catch {}
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
