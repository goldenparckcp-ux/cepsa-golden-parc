const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:EgBovcTTPMqZga5W@db.vktqecgylkjogquhsymz.supabase.co:5432/postgres' });
async function setup() {
    await client.connect();
    
    await client.query(`
        CREATE TABLE IF NOT EXISTS public.hero_sliders (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            page_name TEXT NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT,
            badge_text TEXT,
            cta_text TEXT,
            image_url TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
        );
    `);
    console.log('Table created or exists.');
    
    const { rowCount } = await client.query(`SELECT count(*) FROM public.hero_sliders`);
    if (rowCount > 0) {
        const count = await client.query(`SELECT count(*) FROM public.hero_sliders`);
        if (parseInt(count.rows[0].count) === 0) {
            await client.query(`
                INSERT INTO public.hero_sliders (page_name, title, subtitle, badge_text, cta_text, image_url, sort_order)
                VALUES 
                ('pool', 'PISCINE & DÉTENTE', 'Une oasis de fraîcheur pour petits et grands', 'ÉVASION', 'RÉSERVER', 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80', 1),
                ('pool', 'NOCTURNES INOUBLIABLES', 'Baignade sous les étoiles et ambiance lounge', 'SOIRÉES', 'DÉCOUVRIR', 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80', 2),
                ('restaurant', 'MOMENT GOURMAND', 'Découvrez notre nouvelle carte estivale pleine de fraîcheur', 'NOUVEAUTÉ', 'VOIR MENU', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', 1),
                ('restaurant', 'L''ART DE LA TABLE', 'Des saveurs authentiques dans un cadre exceptionnel', 'PREMIUM', 'RÉSERVER', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80', 2),
                ('hotel', 'LUXE & CONFORT ABSOLU', 'Des chambres d''exception conçues pour votre bien-être', 'PRÉMIUM', 'VOIR CHAMBRES', 'https://images.unsplash.com/photo-1542314831-c6a4d14d8379?auto=format&fit=crop&w=1200&q=80', 1)
            `);
            console.log('Inserted default values.');
        } else {
            console.log('Data already exists.');
        }
    }
    
    await client.end();
}
setup().catch(console.error);
