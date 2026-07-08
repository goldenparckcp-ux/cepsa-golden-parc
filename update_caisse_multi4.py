import re

path = 'app/staff/caisse/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

s_block_start = c.find('const handleSearch = async (code?: string) => {')
s_block_end = c.find('};\n\n    const handleConfirmPayment', s_block_start)

if s_block_start != -1 and s_block_end != -1:
    s_replacement = '''const handleSearch = async (code?: string) => {
        const query = code || searchQuery;
        if (!query.trim()) return;

        setLoading(true);
        setMessage(null);
        setOrder(null);

        try {
            const upQuery = query.trim().toUpperCase();
            
            // 1. Try to find in restaurant
            let { data, error } = await adminDb("restaurant_orders")
                .select("*")
                .eq("order_number", upQuery)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setOrder({ ...data, order_type: "restaurant" });
                return;
            }
            
            // 2. Try to find in pool_bookings
            // pool uses booking_number (e.g. POOL-8289) or id (for legacy/fallback)
            let { data: poolData, error: poolError } = await adminDb("pool_bookings")
                .select("*")
                .eq("booking_number", upQuery)
                .maybeSingle();
                
            if (!poolData && query.trim().length > 20) {
                const { data: idData } = await adminDb("pool_bookings")
                    .select("*")
                    .eq("id", query.trim())
                    .maybeSingle();
                poolData = idData;
            }

            if (poolData) {
                setOrder({ ...poolData, order_type: "pool" });
                return;
            }

            setMessage({ type: 'error', text: "Aucune commande ou réservation trouvée avec ce numéro." });
        } catch (err: any) {
            console.error("Error fetching order:", err);
            setMessage({ type: 'error', text: "Erreur lors de la recherche." });
        } finally {
            setLoading(false);
        }
    '''
    
    c = c[:s_block_start] + s_replacement + c[s_block_end:]
    print("Replaced handleSearch successfully.")

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

