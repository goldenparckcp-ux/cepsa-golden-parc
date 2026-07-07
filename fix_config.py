import re

path_next = 'next.config.ts'
with open(path_next, 'r', encoding='utf-8') as f:
    c = f.read()

supabase_domain = '''      {
        protocol: 'https',
        hostname: 'vktqecgylkjogquhsymz.supabase.co',
      },'''

if "vktqecgylkjogquhsymz.supabase.co" not in c:
    c = c.replace(
        "hostname: 'images.unsplash.com',\n      },",
        f"hostname: 'images.unsplash.com',\n      }},\n{supabase_domain}"
    )

with open(path_next, 'w', encoding='utf-8') as f:
    f.write(c)

print("Added Supabase domain to next.config.ts")
