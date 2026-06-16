const { Client } = require('pg');

const connectionString = "postgresql://postgres:EgBovcTTPMqZga5W@[2a05:d018:65a:e202:51ae:29f1:5502:5fd]:5432/postgres";

const client = new Client({
  connectionString: connectionString,
});

async function run() {
  await client.connect();
  console.log('Connected to database.');

  try {
    console.log('Creating lubricant_items table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.lubricant_items (
          id uuid default uuid_generate_v4() primary key,
          name text not null,
          type text not null,
          description text not null,
          price numeric not null,
          image_url text,
          features text[] default '{}'::text[],
          is_available boolean default true not null,
          sort_order integer default 0 not null,
          created_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    `);
    
    console.log('Enabling RLS on lubricant_items...');
    await client.query(`ALTER TABLE public.lubricant_items ENABLE ROW LEVEL SECURITY;`);
    await client.query(`DROP POLICY IF EXISTS "Enable all access for lubricant_items" ON public.lubricant_items;`);
    await client.query(`CREATE POLICY "Enable all access for lubricant_items" ON public.lubricant_items FOR ALL USING (true) WITH CHECK (true);`);

    console.log('Seeding initial lubricants...');
    await client.query(`
      INSERT INTO public.lubricant_items (name, type, description, price, image_url, features, sort_order)
      SELECT 'Cepsa Xtar 5W30', 'Synthétique', 'Huile moteur 100% synthétique de très haute technologie, conçue pour les moteurs modernes de dernière génération. Offre une protection maximale contre l''usure.', 350, 'https://images.unsplash.com/photo-1621255554101-78c43fb3f538?auto=format&fit=crop&w=600&q=80', ARRAY['Protection Max', 'Éco-Carburant', 'Longue Durée'], 1
      WHERE NOT EXISTS (SELECT 1 FROM public.lubricant_items WHERE name = 'Cepsa Xtar 5W30');
    `);
    await client.query(`
      INSERT INTO public.lubricant_items (name, type, description, price, image_url, features, sort_order)
      SELECT 'Cepsa Genuine 10W40', 'Semi-Synthétique', 'Huile semi-synthétique polyvalente pour une large gamme de véhicules. Garantit un excellent nettoyage du moteur et une bonne stabilité thermique.', 220, 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=600&q=80', ARRAY['Nettoyage', 'Polyvalent', 'Protection'], 2
      WHERE NOT EXISTS (SELECT 1 FROM public.lubricant_items WHERE name = 'Cepsa Genuine 10W40');
    `);
    await client.query(`
      INSERT INTO public.lubricant_items (name, type, description, price, image_url, features, sort_order)
      SELECT 'Cepsa Avant 15W40', 'Minérale', 'Huile minérale robuste, idéale pour les véhicules lourds, agricoles et anciens moteurs. Très grande résistance thermique.', 180, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80', ARRAY['Robuste', 'Haute Pression', 'Engins Lourds'], 3
      WHERE NOT EXISTS (SELECT 1 FROM public.lubricant_items WHERE name = 'Cepsa Avant 15W40');
    `);
    await client.query(`
      INSERT INTO public.lubricant_items (name, type, description, price, image_url, features, sort_order)
      SELECT 'Cepsa Transmission 80W90', 'Huile de Boîte', 'Lubrifiant extrême pression pour boîtes de vitesses manuelles et ponts. Protection optimale des engrenages.', 150, 'https://images.unsplash.com/photo-1635048424329-a9ebfb3d12c6?auto=format&fit=crop&w=600&q=80', ARRAY['Anti-usure', 'Extrême Pression'], 4
      WHERE NOT EXISTS (SELECT 1 FROM public.lubricant_items WHERE name = 'Cepsa Transmission 80W90');
    `);

    console.log('Creating fuel_prices table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.fuel_prices (
          id text primary key,
          gasoil numeric not null default 12.50,
          sans_plomb numeric not null default 14.20,
          updated_at timestamp with time zone default timezone('utc'::text, now()) not null
      );
    `);

    console.log('Enabling RLS on fuel_prices...');
    await client.query(`ALTER TABLE public.fuel_prices ENABLE ROW LEVEL SECURITY;`);
    await client.query(`DROP POLICY IF EXISTS "Enable all access for fuel_prices" ON public.fuel_prices;`);
    await client.query(`CREATE POLICY "Enable all access for fuel_prices" ON public.fuel_prices FOR ALL USING (true) WITH CHECK (true);`);

    console.log('Seeding initial fuel prices...');
    await client.query(`
      INSERT INTO public.fuel_prices (id, gasoil, sans_plomb)
      SELECT 'current', 12.50, 14.20
      WHERE NOT EXISTS (SELECT 1 FROM public.fuel_prices WHERE id = 'current');
    `);

    console.log('All migrations executed successfully!');
  } catch (err) {
    console.error('Error executing migrations:', err);
  } finally {
    await client.end();
  }
}

run();
