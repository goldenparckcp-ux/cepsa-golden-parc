import re

path = 'app/admin/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Fix fetchData used before declaration
# Find useEffect with fetchData and timeFilter, remove it, and place it AFTER fetchData
effect_pattern = r'useEffect\(\(\) => \{\s+const stored = localStorage\.getItem\("staff_session"\);.*?fetchData\(\);\s+\}, \[fetchData, timeFilter\]\);'

# But wait, fetchData uses state. It's better to just remove `fetchData` from the dependency array 
# and use // eslint-disable-next-line react-hooks/exhaustive-deps
# Let's find the use effect exactly.
m = re.search(r'(useEffect\(\(\) => \{.*?fetchData\(\);\n\s+\}, \[fetchData, timeFilter\]\);)', c, flags=re.DOTALL)
if m:
    effect_code = m.group(1)
    new_effect_code = effect_code.replace('[fetchData, timeFilter]', '[timeFilter]')
    c = c.replace(effect_code, new_effect_code)
    # add eslint disable
    c = c.replace('}, [timeFilter]);', '// eslint-disable-next-line react-hooks/exhaustive-deps\n    }, [timeFilter]);')

# 2. Add 180 and 365 to chartRange
c = c.replace('useState<7 | 14 | 30>(7)', 'useState<7 | 14 | 30 | 180 | 365>(7)')
c = c.replace('{([7, 14, 30] as const).map(n =>', '{([7, 14, 30, 180, 365] as const).map(n =>')
# Rename them in the button text to 6m, 1an for 180 and 365
# The button text currently is `{n}j`
button_code = r'>\{n\}j<\/button>'
def replace_button_text(match):
    return '>{n === 180 ? "6m" : n === 365 ? "1an" : n + "j"}</button>'
c = re.sub(button_code, '>{n === 180 ? "6m" : n === 365 ? "1an" : n + "j"}</button>', c)

# 3. Add onError to Images to hide them if they fail
# <Image src={item.image} alt={item.name} width={36} height={36} className="object-cover w-full h-full" unoptimized={item.image?.startsWith("http")} />
c = re.sub(r'(<Image[^>]+unoptimized=\{item\.image\?\.startsWith\("http"\)\}) />', r'\1 onError={(e) => { e.currentTarget.style.opacity = "0"; }} />', c)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed admin page")
