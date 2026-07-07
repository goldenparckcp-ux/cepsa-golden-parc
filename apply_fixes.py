import re
import sys

# 1. FIX MENU IMAGES
path_menu = 'lib/types/menu.ts'
with open(path_menu, 'r', encoding='utf-8') as f:
    c_menu = f.read()

# Replace broken Supabase URLs with Unsplash ones
# Tacos
c_menu = c_menu.replace(
    'image: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/taxos.jpeg",',
    'image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800",' # Unsplash tacos
)
# Couscous
c_menu = c_menu.replace(
    'image: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/couscous.jpeg",',
    'image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800",' # Unsplash couscous/tajine
)
# Djaj Mhamer
c_menu = c_menu.replace(
    'image: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/djaj_m7amar.jpeg",',
    'image: "https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=800",' # Unsplash roasted chicken
)
# Pasticcio
c_menu = c_menu.replace(
    'image: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/les_pate.jpeg",',
    'image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800",' # Unsplash pasta
)

with open(path_menu, 'w', encoding='utf-8') as f:
    f.write(c_menu)


# 2. UPDATE ADMIN PAGE (CUSTOM DATES + OPTIMIZATION)
path_admin = 'app/admin/page.tsx'
with open(path_admin, 'r', encoding='utf-8') as f:
    c_admin = f.read()

# Remove unoptimized from Image tags to improve performance
c_admin = re.sub(r'\s*unoptimized=\{[^\}]+\}', '', c_admin)

# Add custom date picker state
if "const [customDate, setCustomDate]" not in c_admin:
    state_injection = '''const [chartRange, setChartRange] = useState<7 | 14 | 30 | 180 | 365 | "custom">(7);
    const [customDate, setCustomDate] = useState({ start: "", end: "" });'''
    c_admin = re.sub(r'const \[chartRange, setChartRange\].*?;', state_injection, c_admin)

# Update chartDays calculation
if "const chartDays = useMemo(" in c_admin:
    new_chart_days = '''const chartDays = useMemo(() => {
        if (chartRange === "custom" && customDate.start && customDate.end) {
            const days = [];
            const d = new Date(customDate.start);
            const end = new Date(customDate.end);
            while (d <= end) {
                days.push(d.toISOString().split("T")[0]);
                d.setDate(d.getDate() + 1);
            }
            return days.slice(-60); // limit to 60 days to prevent chart overflow/lag
        }
        const n = typeof chartRange === "number" ? chartRange : 7;
        return getLastNDays(n);
    }, [chartRange, customDate]);'''
    c_admin = re.sub(r'const chartDays = useMemo\(\(\) => getLastNDays\(chartRange\), \[chartRange\]\);', new_chart_days, c_admin)

# Update buttons for chart range (remove 180 and 365, add custom)
buttons_code = r'\{\(\[7, 14, 30, 180, 365\] as const\)\.map\(n => \(.*?\n.*?<\/button>\n\s*\)\)\}'
new_buttons = '''{([7, 14, 30] as const).map(n => (
                                          <button key={n} onClick={() => setChartRange(n)}
                                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${chartRange === n ? "bg-emerald-500 text-black" : "text-gray-500 hover:text-white"}`}
                                          >{n}j</button>
                                      ))}
                                      <button onClick={() => setChartRange("custom")}
                                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${chartRange === "custom" ? "bg-emerald-500 text-black" : "text-gray-500 hover:text-white"}`}
                                      >Période...</button>'''
c_admin = re.sub(buttons_code, new_buttons, c_admin, flags=re.DOTALL)

# Add custom date inputs if chartRange is "custom"
if "type=\"date\"" not in c_admin:
    custom_inputs = '''</div>
                                  
                                  {chartRange === "custom" && (
                                      <div className="flex gap-2 items-center animate-in fade-in zoom-in-95 mt-2 md:mt-0 md:ml-4">
                                          <input type="date" value={customDate.start} onChange={e => setCustomDate({...customDate, start: e.target.value})} className="bg-[#0F172A] border border-white/10 text-white text-[10px] px-2 py-1.5 rounded-lg" />
                                          <span className="text-gray-500">-</span>
                                          <input type="date" value={customDate.end} onChange={e => setCustomDate({...customDate, end: e.target.value})} className="bg-[#0F172A] border border-white/10 text-white text-[10px] px-2 py-1.5 rounded-lg" />
                                      </div>
                                  )}'''
    c_admin = c_admin.replace('</div>\n                          <div className="grid grid-cols-3 gap-3 mt-4', custom_inputs + '\n                          <div className="grid grid-cols-3 gap-3 mt-4')

# Update X-axis labels to look pretty (e.g. "4 Juil")
# In the original, it was: `labels: chartDays.map(d => shortDay(d))`
# Wait, shortDay(d) already does: `new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }).replace(".", "")`
# Which outputs e.g. "mer 5". The user said "4 Juil" or just prettier dates. 
# Let's change shortDay function.
def_shortday = r'function shortDay\(iso: string\) \{.*?\}'
new_shortday = '''function shortDay(iso: string) {
    return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" }).replace(".", "");
}'''
c_admin = re.sub(def_shortday, new_shortday, c_admin, flags=re.DOTALL)

with open(path_admin, 'w', encoding='utf-8') as f:
    f.write(c_admin)

print("Updates applied")
