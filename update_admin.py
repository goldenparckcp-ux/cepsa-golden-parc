import re
import sys

path = 'app/admin/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# 1. Add timeFilter state
state_pattern = r'const \[chartRange, setChartRange\] = useState<7 \| 14 \| 30>\(7\);'
new_state = r'''const [chartRange, setChartRange] = useState<7 | 14 | 30>(7);
    const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month" | "all">("all");'''
if 'const [timeFilter' not in c:
    c = re.sub(state_pattern, new_state, c)

# 2. Add Calendar to lucide-react imports if missing
if 'Calendar' not in c.split('from "lucide-react"')[0]:
    c = c.replace('import {', 'import { Calendar,', 1)

# 3. Update fetchData
fetch_pattern = r'const fetchData = useCallback\(async \(\) => \{.*?(?=const fetchAI = useCallback)'

new_fetch = '''const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let startDate: string | null = null;
            const now = new Date();
            if (timeFilter === "today") {
                startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            } else if (timeFilter === "week") {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                startDate = weekAgo.toISOString();
            } else if (timeFilter === "month") {
                const monthAgo = new Date();
                monthAgo.setDate(monthAgo.getDate() - 30);
                startDate = monthAgo.toISOString();
            }

            let roQuery = supabase.from("restaurant_orders").select("*").order("created_at", { ascending: false });
            let hrQuery = supabase.from("hotel_reservations").select("*").order("created_at", { ascending: false });
            let pbQuery = supabase.from("pool_bookings").select("*").order("created_at", { ascending: false });
            let sbQuery = supabase.from("service_bookings").select("*").order("created_at", { ascending: false });

            if (startDate) {
                roQuery = roQuery.gte("created_at", startDate);
                hrQuery = hrQuery.gte("created_at", startDate);
                pbQuery = pbQuery.gte("created_at", startDate);
                sbQuery = sbQuery.gte("created_at", startDate);
            }

            const [{ data: ro }, { data: hr }, { data: pb }, { data: sb }] = await Promise.all([
                roQuery, hrQuery, pbQuery, sbQuery
            ]);

            const rOrders = ro || [];
            setAllRestoOrders(rOrders);

            const today = new Date().toISOString().split("T")[0];
            const itemMap: Record<string, any> = {};
            let restoRev = 0, pending = 0, doneToday = 0;

            rOrders.forEach(o => {
                const total = Number(o.total_price) || Number(o.subtotal) || 0;
                const dep = Number(o.deposit_amount) || 0;
                let paid = 0;
                if (o.deposit_paid) paid = (o.status === "completed" || dep >= total) ? total : dep;
                else if (o.status === "completed") paid = total;

                if (paid > 0) {
                    restoRev += paid;
                    let items: any[] = [];
                    try { items = typeof o.items === "string" ? JSON.parse(o.items) : (o.items || []); } catch { }
                    items.filter(it => !it.is_meta).forEach((it: any) => {
                        const name = it.name || "Article";
                        const qty = Number(it.quantity) || 1;
                        const price = Number(it.price) || Number(it.basePrice) || 0;
                        let img = it.image || it.img || "";
                        if (!img) { const m = COMPLETE_MENU.find(m => m.name.toLowerCase() === name.toLowerCase()); img = m?.image || ""; }
                        if (!itemMap[name]) {
                            const m = COMPLETE_MENU.find(m => m.name.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(m.name.split(" ")[0].toLowerCase()));
                            itemMap[name] = { qty: 0, revenue: 0, image: img || m?.image || "", description: m?.description || "", category: m?.category || "", badge: m?.badge || "", prices: [] };
                        }
                        itemMap[name].qty += qty;
                        itemMap[name].revenue += price * qty;
                        if (price > 0) itemMap[name].prices.push(price);
                        if (!itemMap[name].image && img) itemMap[name].image = img;
                    });
                }
                if (o.status === "pending" || o.status === "preparing") pending++;
                if (o.status === "completed" && (o.updated_at || o.created_at || "").split("T")[0] === today) doneToday++;
            });

            const sortedItems = Object.entries(itemMap)
                .map(([name, d]: any) => ({
                    name, ...d,
                    avgPrice: d.prices.length ? Math.round(d.prices.reduce((a: number, b: number) => a + b, 0) / d.prices.length) : 0,
                    isTest: name.startsWith("Plat Playwright") || name.startsWith("Test")
                }))
                .filter(it => !it.isTest)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 6);
            setTopItems(sortedItems);

            const hRes = hr || [];
            let hotelRev = 0, occupied = 0;
            hRes.forEach(r => {
                const p = Number(r.price) || Number(r.total_price) || 0;
                if (r.status !== "cancelled") hotelRev += p;
                if (["checked_in", "active"].includes(r.status)) occupied++;
            });

            const pBook = pb || [];
            let poolRev = 0, activePax = 0;
            pBook.forEach(b => {
                if (b.status !== "cancelled") poolRev += Number(b.total_price) || Number(b.total_amount) || 0;
                if (["checked_in", "active"].includes(b.status)) activePax += (Number(b.adults) || 0) + (Number(b.children) || 0);
            });

            const sBook = sb || [];
            let serviceRev = 0, lavages = 0;
            sBook.forEach(s => {
                if (s.status === "completed") serviceRev += Number(s.price) || Number(s.total_price) || 0;
                if (s.service_type === "lavage" && !["completed", "cancelled"].includes(s.status)) lavages++;
            });

            const totalRev = restoRev + hotelRev + poolRev + serviceRev;
            const paid = rOrders.filter(o => o.status === "completed" || (o.deposit_paid && Number(o.deposit_amount) >= (Number(o.total_price) || Number(o.subtotal)))).length;

            setStats({
                totalRevenue: totalRev, restoRevenue: restoRev, hotelRevenue: hotelRev,
                poolRevenue: poolRev, servicesRevenue: serviceRev,
                occupancyRate: Math.min(Math.round((occupied / 10) * 100), 100),
                activePoolGuests: activePax, pendingOrdersCount: pending, completedOrdersToday: doneToday,
                lavagesCount: lavages, totalOrdersCount: rOrders.length,
                avgOrderValue: paid > 0 ? Math.round(restoRev / paid) : 0,
            });

            setRecentOrders(rOrders.slice(0, 6));
            setHotelRooms(hRes.slice(0, 5));
            setAllHotelReservations(hRes);
            setAllPoolBookings(pBook);
            setAllServiceBookings(sBook);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    }, [timeFilter]);

    '''

if 'timeFilter' not in c.split('const fetchAI')[0]:
    c = re.sub(fetch_pattern, new_fetch, c, flags=re.DOTALL)

# Update useEffect dependencies to run fetchData when timeFilter changes
useeffect_pattern = r'fetchData\(\);\n    \}, \[\]\);'
if 'fetchData();\n    }, [timeFilter]);' not in c:
    c = re.sub(useeffect_pattern, 'fetchData();\n    }, [fetchData, timeFilter]);', c)

# 4. Add UI toggles for timeFilter
# Look for the refresh button
# <button onClick={fetchData} disabled={loading} className="p-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-all disabled:opacity-50">
#     <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
# </button>

header_pattern = r'(<button\s*onClick=\{fetchData\}\s*disabled=\{loading\}.*?>.*?<\/button>)'
new_header = r'''\1
                <div className="flex bg-[#1E293B] rounded-xl p-1 border border-white/5 ml-2 md:ml-4">
                    <button onClick={() => setTimeFilter("today")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === "today" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>Aujourd'hui</button>
                    <button onClick={() => setTimeFilter("week")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === "week" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>Semaine</button>
                    <button onClick={() => setTimeFilter("month")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === "month" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>Mois</button>
                    <button onClick={() => setTimeFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeFilter === "all" ? "bg-primary text-white shadow-md" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>Global</button>
                </div>'''

if 'setTimeFilter("today")' not in c:
    c = re.sub(header_pattern, new_header, c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Modified app/admin/page.tsx")
