import re

path = 'app/admin/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add Download icon if not present
if 'Download' not in c:
    c = c.replace('import { Utensils, LayoutGrid, Tag, LogOut, ChevronRight, CheckCircle2, AlertCircle, RefreshCw, Star, Users, MapPin, Building2, Store } from "lucide-react";',
                  'import { Utensils, LayoutGrid, Tag, LogOut, ChevronRight, CheckCircle2, AlertCircle, RefreshCw, Star, Users, MapPin, Building2, Store, Download } from "lucide-react";')

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
        link.setAttribute("download", `Export_Ventes_${chartRange}j.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
'''

if 'exportToCSV' not in c:
    c = c.replace('    return {\n        days: chartDays,\n        vals: arr,\n        sales: salesArr\n    };\n  }, [chartDays, allRestoOrders]);',
                  '    return {\n        days: chartDays,\n        vals: arr,\n        sales: salesArr\n    };\n  }, [chartDays, allRestoOrders]);\n\n' + export_fn)

# Add Export Button to the Header of the Dashboard
header_inject = '''                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                          <div className="flex items-center gap-2 mb-1">
                              <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600" />
                              <h1 className="text-2xl font-black text-white">Tableau de Bord Admin</h1>
                          </div>
                          <p className="text-xs text-gray-500 font-medium pl-3.5">
                              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                              {" • "}Données en temps réel
                          </p>
                      </div>
                      <div className="flex items-center gap-2">
                          <button
                              onClick={exportToCSV}
                              className="py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold hover:bg-amber-500 hover:text-black transition-all text-xs flex items-center gap-2"
                              title="Exporter les données du graphique en CSV"
                          >
                              <Download className="w-4 h-4" />
                              Exporter CSV
                          </button>
                      </div>
                  </div>'''

c = re.sub(r'                  <div>\s*<div className="flex items-center gap-2 mb-1">\s*<div className="w-1\.5 h-5 rounded-full bg-gradient-to-b from-amber-400 to-orange-600" />\s*<h1 className="text-2xl font-black text-white">Tableau de Bord Admin</h1>\s*</div>\s*<p className="text-xs text-gray-500 font-medium pl-3\.5">.*?Données en temps réel\s*</p>\s*</div>', header_inject, c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print("Export CSV added to Admin page.")
