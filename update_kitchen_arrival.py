import re

path = 'app/staff/restaurant/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

badge_html = '''
                                          {isEnRoute && meta.table_number && (
                                              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-red-500/20 whitespace-nowrap animate-pulse border border-red-400 z-10">
                                                  o. LE CLIENT EST ARRIV (Place {meta.table_number}) !
                                              </div>
                                          )}
'''

# Find the start of the order card: <div className={`relative p-5 rounded-3xl bg-[#1E293B] border
c = c.replace('<div className={`relative p-5 rounded-3xl bg-[#1E293B] border ${cardColorClass} transition-all duration-300 shadow-xl overflow-hidden`}>',
              '<div className={`relative p-5 rounded-3xl bg-[#1E293B] border ${cardColorClass} transition-all duration-300 shadow-xl overflow-hidden`}>' + badge_html)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print("Updated Kitchen Arrival UI.")
