import re

path = 'app/admin/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('}).replace(".", "");\n}', '}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Syntax error fixed")
