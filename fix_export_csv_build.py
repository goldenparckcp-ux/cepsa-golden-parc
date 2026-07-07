import re

path = 'app/admin/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

target = """        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Chiffre d'Affaires (DH),Ventes\\n";
        
        chartData.days.forEach((day, i) => {
            csvContent += `${day},${chartData.vals[i]},${chartData.sales[i]}\\n`;
        });"""

replacement = """        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Chiffre d'Affaires (DH)\\n";
        
        chartData.labels.forEach((label, i) => {
            csvContent += `${label},${chartData.vals[i]}\\n`;
        });"""

c = c.replace(target, replacement)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
