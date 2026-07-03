require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('home_promos')
    .select('id')
    .eq('sort_order', -999)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error(error);
    return;
  }

  if (!data) {
    await supabase.from('home_promos').insert({
      badge_fr: 'SYSTEM_CONTACT',
      badge_ar: 'SYSTEM_CONTACT',
      title_fr: "Vous n'avez pas trouvé votre réponse ?",
      title_ar: "لم تجد إجابتك؟",
      desc_fr: "Notre équipe est disponible pour vous aider 24h/24, 7j/7.",
      desc_ar: "فريقنا متاح لمساعدتك على مدار 24 ساعة طوال أيام الأسبوع.",
      link_path: "06 61 69 01 79",
      gradient_class: "contact",
      sort_order: -999,
      is_active: false
    });
    console.log("Contact settings initialized!");
  } else {
    console.log("Contact settings already exists.");
  }
}

run();
