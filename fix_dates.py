import re

path_admin = 'app/admin/page.tsx'
with open(path_admin, 'r', encoding='utf-8') as f:
    c_admin = f.read()

# Initialize customDate with last 7 days
c_admin = c_admin.replace(
    'const [customDate, setCustomDate] = useState({ start: "", end: "" });',
    'const [customDate, setCustomDate] = useState({ start: new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0], end: new Date().toISOString().split("T")[0] });'
)

with open(path_admin, 'w', encoding='utf-8') as f:
    f.write(c_admin)

print("Dates initialized")
