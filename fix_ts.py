import re

path = 'app/admin/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('/ (chartRange || 1)', '/ (chartData.vals.length || 1)')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Fixed arithmetic error")
