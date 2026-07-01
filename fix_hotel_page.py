import re

path = 'app/hotel/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Fix mode switcher to be fully rounded instead of a pill with 2rem
c = c.replace(
    'className="relative bg-[#111827]/40 p-1.5 rounded-[2rem] border border-white/5 flex w-full shadow-2xl backdrop-blur-md"',
    'className="relative bg-[#111827]/40 p-1.5 rounded-full border border-white/5 flex w-full shadow-2xl backdrop-blur-md"'
)

c = c.replace(
    'className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-3xl transition-all duration-500 ease-in-out shadow-lg',
    'className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-500 ease-in-out shadow-lg'
)

# 2. Fix the Reserver button to be rounded-full
c = re.sub(
    r'className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black py-4 rounded-2xl',
    'className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black py-4 rounded-full',
    c
)

c = re.sub(
    r'className="w-full bg-gray-600/50 cursor-not-allowed text-white/50 font-black py-4 rounded-2xl',
    'className="w-full bg-gray-600/50 cursor-not-allowed text-white/50 font-black py-4 rounded-full',
    c
)

# 3. Fix the bottom padding on the main container
c = c.replace(
    'className="min-h-screen pt-24 md:pt-28 pb-32 bg-[#0B0F19] font-sans text-white relative overflow-hidden"',
    'className="min-h-screen pt-24 md:pt-28 pb-40 bg-[#0B0F19] font-sans text-white relative overflow-hidden"'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Hotel page shapes fixed.')
