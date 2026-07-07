import re

path_caisse = 'app/staff/caisse/page.tsx'
with open(path_caisse, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add state for daily summary
state_injection = '''
    const [dailySummary, setDailySummary] = useState({ totalEspèces: 0, totalCarte: 0, ordersCount: 0 });

    const fetchDailySummary = async () => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const { data, error } = await adminDb("restaurant_orders")
                .select("total_price, subtotal, payment_method")
                .gte("created_at", today.toISOString())
                .eq("deposit_paid", true);

            if (error) throw error;
            if (data) {
                let especes = 0;
                let carte = 0;
                data.forEach((o: any) => {
                    const price = o.total_price || o.subtotal || 0;
                    if (o.payment_method?.toLowerCase() === "cash") {
                        especes += price;
                    } else if (o.payment_method?.toLowerCase() === "cmi") {
                        carte += price;
                    }
                });
                setDailySummary({ totalEspèces: especes, totalCarte: carte, ordersCount: data.length });
            }
        } catch (err) {
            console.error("Error fetching summary:", err);
        }
    };

    useEffect(() => {
        const stored = localStorage.getItem("staff_session");
        if (stored) {
            try {
                const session = JSON.parse(stored);
                if (session.role !== "caisse" && session.role !== "admin") {
                    router.push("/staff");
                    return;
                }
                fetchDailySummary(); // Fetch initially
            } catch (e) {
                localStorage.removeItem("staff_session");
                router.push("/staff");
                return;
            }
        } else {
            router.push("/staff");
            return;
        }
    }, [router]);
'''

# Replace the old useEffect with the new state and modified useEffect
c = re.sub(r'    // Session Check\n    useEffect\(\(\) => \{.*?\n        \}\n    \}, \[router\]\);', state_injection, c, flags=re.DOTALL)

# Add fetchDailySummary() to handleConfirmPayment onSuccess
c = c.replace('setSearchQuery("");', 'setSearchQuery("");\n            fetchDailySummary();')

# Add the UI for Bilan du Jour
ui_injection = '''
                {/* Bilan du Jour */}
                <div className="bg-[#1E293B] border border-white/10 rounded-2xl p-5 mt-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                        <Banknote className="w-4 h-4 text-green-400" /> Bilan du Jour (Caisse)
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
                            <span className="block text-[10px] text-green-400 font-bold uppercase mb-1">Total Espèces</span>
                            <span className="block text-xl font-black text-green-400">{dailySummary.totalEspèces.toFixed(2)} DH</span>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                            <span className="block text-[10px] text-blue-400 font-bold uppercase mb-1">Total Carte (CMI)</span>
                            <span className="block text-lg font-bold text-blue-400">{dailySummary.totalCarte.toFixed(2)} DH</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                            <span className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Commandes</span>
                            <span className="block text-lg font-bold text-white">{dailySummary.ordersCount}</span>
                        </div>
                    </div>
                </div>

                {/* Scanners & Search controls */}'''

c = c.replace('{/* Scanners & Search controls */}', ui_injection)

with open(path_caisse, 'w', encoding='utf-8') as f:
    f.write(c)
print("Updated caisse page.")
