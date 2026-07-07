import re

path_admin = 'app/admin/page.tsx'
with open(path_admin, 'r', encoding='utf-8') as f:
    c_admin = f.read()

# Force COMPLETE_MENU to take precedence over the old DB image
c_admin = re.sub(
    r'itemMap\[name\] = \{ qty: 0, revenue: 0, image: img \|\| m\?\.image \|\| "", description:',
    'itemMap[name] = { qty: 0, revenue: 0, image: m?.image || img || "", description:',
    c_admin
)

# Insert the date inputs correctly right after the Période button
buttons_block = r'(<button onClick=\{\(\) => setChartRange\("custom"\)\}.*?>Période\.\.\.<\/button>\s*<\/div>\s*<\/div>\s*<\/div>)'

custom_inputs = r'''\1
                                  {chartRange === "custom" && (
                                      <div className="flex gap-2 items-center justify-end mt-3 mb-2 animate-in fade-in zoom-in-95">
                                          <input type="date" value={customDate.start} onChange={e => setCustomDate({...customDate, start: e.target.value})} className="bg-[#0F172A] border border-white/10 text-white text-[10px] px-2 py-1.5 rounded-lg" />
                                          <span className="text-gray-500 text-xs">à</span>
                                          <input type="date" value={customDate.end} onChange={e => setCustomDate({...customDate, end: e.target.value})} className="bg-[#0F172A] border border-white/10 text-white text-[10px] px-2 py-1.5 rounded-lg" />
                                      </div>
                                  )}'''

c_admin = re.sub(buttons_block, custom_inputs, c_admin, flags=re.DOTALL)

with open(path_admin, 'w', encoding='utf-8') as f:
    f.write(c_admin)

print("UI fixed")
