const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:EgBovcTTPMqZga5W@db.vktqecgylkjogquhsymz.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();
  
  await client.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      id SERIAL PRIMARY KEY,
      key VARCHAR(255) UNIQUE NOT NULL,
      value JSONB NOT NULL
    );
    
    ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
    
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_policies
            WHERE schemaname = 'public'
              AND tablename = 'site_settings'
              AND policyname = 'Allow public read access'
        ) THEN
            CREATE POLICY "Allow public read access" ON site_settings FOR SELECT USING (true);
        END IF;
    END
    $$;

    INSERT INTO site_settings (key, value)
    VALUES ('contact_info', '{"phone": "06 61 69 01 79", "title_fr": "Vous n''avez pas trouvé votre réponse ?", "title_ar": "لم تجد إجابتك؟", "subtitle_fr": "Notre équipe est disponible pour vous aider 24h/24, 7j/7.", "subtitle_ar": "فريقنا متاح لمساعدتك على مدار 24 ساعة طوال أيام الأسبوع."}')
    ON CONFLICT (key) DO NOTHING;
  `);
  
  console.log("DB setup complete.");
  await client.end();
}
run();
