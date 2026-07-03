import re

path = 'app/admin/layout.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add Phone icon if not imported
if "Phone" not in c.split('from "lucide-react"')[0]:
    c = c.replace('import { Lock, LayoutDashboard, Utensils, Bed, Ticket, DollarSign, PlusCircle, LogOut, ExternalLink, Menu, X, Shield, RefreshCw, QrCode, Image as ImageIcon } from "lucide-react";', 'import { Lock, LayoutDashboard, Utensils, Bed, Ticket, DollarSign, PlusCircle, LogOut, ExternalLink, Menu, X, Shield, RefreshCw, QrCode, Image as ImageIcon, Phone } from "lucide-react";')

# Find the admin nav links and add Contact
contact_link = """
                        <NavLink href="/admin/qrcodes" icon={<QrCode className="w-5 h-5" />} label="QR Codes Tables" />
                        <NavLink href="/admin/contact" icon={<Phone className="w-5 h-5" />} label="Coordonnées / FAQ" />"""

c = c.replace('<NavLink href="/admin/qrcodes" icon={<QrCode className="w-5 h-5" />} label="QR Codes Tables" />', contact_link)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Added Contact link to admin layout!")
