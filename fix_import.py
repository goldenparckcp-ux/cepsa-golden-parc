import re

path = 'app/services/pool/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace(
    'import { ChevronLeft, CheckCircle2, Ticket, Sun, Users, Baby } from "lucide-react";',
    'import { ChevronLeft, CheckCircle2, Ticket, Sun, Users, Baby, Waves } from "lucide-react";'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print('Waves import fixed.')
