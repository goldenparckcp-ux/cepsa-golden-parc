import re

# 1. Update Admin Hero Page
path_admin_hero = 'app/admin/hero/page.tsx'
with open(path_admin_hero, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    "page: 'hotel' | 'restaurant' | 'pool' | 'lubricants';",
    "page: 'restaurant' | 'pool' | 'lubricants';"
)
c = c.replace(
    "useState<'hotel' | 'restaurant' | 'pool' | 'lubricants'>('hotel')",
    "useState<'restaurant' | 'pool' | 'lubricants'>('restaurant')"
)
c = c.replace(
    "(['hotel', 'restaurant', 'pool', 'lubricants'] as const).map",
    "(['restaurant', 'pool', 'lubricants'] as const).map"
)

with open(path_admin_hero, 'w', encoding='utf-8') as f:
    f.write(c)


# 2. Update Admin Hotel Page (Remove Hero tab)
path_admin_hotel = 'app/admin/hotel/page.tsx'
with open(path_admin_hotel, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the tabs logic to remove "Bannière Hero"
c = re.sub(
    r'<button\s*onClick=\{[^}]*\}\s*className=\{`px-6 py-2[^`]*\`\}\s*>\s*Bannière Hero\s*</button>',
    '',
    c,
    flags=re.DOTALL
)

# Remove the hero editing section block entirely
hero_block = re.search(r'\{\/\* HERO SECTION \*\/\}.*?\{\/\* RESERVATIONS LIST GRID \*\/\}', c, re.DOTALL)
if hero_block:
    c = c.replace(hero_block.group(0), '{/* RESERVATIONS LIST GRID */}')

with open(path_admin_hotel, 'w', encoding='utf-8') as f:
    f.write(c)

print('Admin pages updated.')
