import re

path = 'app/admin/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add Export function right after useMemo for chartData
export_fn = '''
    const exportToCSV = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Date,Chiffre d'Affaires (DH),Ventes\\n";
        
        chartData.days.forEach((day, i) => {
            csvContent += `${day},${chartData.vals[i]},${chartData.sales[i]}\\n`;
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Export_Ventes.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
'''

# Find a safe place to inject the function inside the component. We can inject it right before the `if (loading) return`
c = c.replace('if (loading) return', export_fn + '\n    if (loading) return')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print("Injected exportToCSV")
