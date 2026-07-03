import re

path = 'app/faq/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add supabase import if not present
if "import { supabase }" not in c:
    c = c.replace('import { motion, AnimatePresence } from "framer-motion";', 'import { motion, AnimatePresence } from "framer-motion";\nimport { supabase } from "@/lib/supabase";\nimport { useTranslation } from "@/lib/state/LanguageContext";')
elif "useTranslation" not in c:
    c = c.replace('import { supabase } from "@/lib/supabase";', 'import { supabase } from "@/lib/supabase";\nimport { useTranslation } from "@/lib/state/LanguageContext";')

# We need to add state for contactSettings
# Find the start of the component
# export default function FAQPage() {
if "const [contactSettings, setContactSettings] = useState" not in c:
    pattern = r'(export default function FAQPage\(\) \{\s+const router = useRouter\(\);)'
    replacement = r'''\1
    const { language } = useTranslation();
    const [contactSettings, setContactSettings] = useState<any>(null);

    React.useEffect(() => {
        const fetchContact = async () => {
            const { data } = await supabase.from('home_promos').select('*').eq('sort_order', -999).single();
            if (data) setContactSettings(data);
        };
        fetchContact();
    }, []);'''
    c = re.sub(pattern, replacement, c)

# Replace the hardcoded Contact Box
contact_box_pattern = r'\{\/\* Contact Box \*\/\}.*?Vous n\'avez pas trouvé votre réponse \?.*?Itinéraire GPS.*?<\/button>\s*<\/div>\s*<\/div>'
new_contact_box = r'''{/* Contact Box */}
                <div className="mt-16 bg-[#111827] rounded-[3rem] p-8 md:p-12 text-center border border-white/5 relative overflow-hidden shadow-2xl">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
                            {contactSettings ? (language === 'ar' ? contactSettings.title_ar : contactSettings.title_fr) : "Vous n'avez pas trouvé votre réponse ?"}
                        </h2>
                        <p className="text-gray-400 mb-8 font-medium">
                            {contactSettings ? (language === 'ar' ? contactSettings.desc_ar : contactSettings.desc_fr) : "Notre équipe est disponible pour vous aider 24h/24, 7j/7."}
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a 
                                href={`tel:${contactSettings?.link_path || '0661690179'}`}
                                className="bg-primary hover:bg-primary-light text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-primary/30"
                            >
                                <Phone className="w-5 h-5" /> 
                                {language === 'ar' ? 'اتصل بـ' : 'Appeler le'} {contactSettings?.link_path || '06 61 69 01 79'}
                            </a>
                            <button 
                                onClick={() => router.push('/scan')}
                                className="bg-[#1E293B] hover:bg-[#2D3748] text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 border border-white/5"
                            >
                                <MapPin className="w-5 h-5" />
                                {language === 'ar' ? 'مسار GPS' : 'Itinéraire GPS'}
                            </button>
                        </div>
                    </div>
                </div>'''

if re.search(contact_box_pattern, c, re.DOTALL):
    c = re.sub(contact_box_pattern, new_contact_box, c, flags=re.DOTALL)
else:
    # Try a looser pattern
    loose_pattern = r'\{\/\* Contact Box \*\/\}.*?(?=<\/div>\s*<\/div>\s*<\/main>)'
    if re.search(loose_pattern, c, re.DOTALL):
        c = re.sub(loose_pattern, new_contact_box, c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print("Updated FAQ page with dynamic contact box!")
