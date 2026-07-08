import re

path = 'app/staff/caisse/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace handleSearch
s_target = '''
    const handleSearch = async (code?: string) => {
        const query = code || searchQuery;
        if (!query.trim()) return;

        setLoading(true);
        setMessage(null);
        setOrder(null);

        try {
            // Fetch order from restaurant_orders
            const { data, error } = await adminDb("restaurant_orders")
                .select("*")
                .eq("order_number", query.trim().toUpperCase())
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setOrder(data);
            } else {
                setMessage({ type: 'error', text: "Aucune commande trouvǸe avec ce numǸro." });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Erreur lors de la recherche." });
        } finally {
            setLoading(false);
        }
    };
'''

s_replacement = '''
    const handleSearch = async (code?: string) => {
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
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Erreur lors de la recherche." });
        } finally {
            setLoading(false);
        }
    };
'''
c = c.replace(s_target.strip(), s_replacement.strip())


c_target = '''
    const handleConfirmPayment = async () => {
        if (!order) return;
        setLoading(true);

        const total = order.total_price || order.subtotal || 0;
        const isAlreadyPaid = order.deposit_paid && (order.deposit_amount >= total);

        try {
            // If it's already ready or if it's already paid and we are just completing it, we set status to completed
            const shouldComplete = order.status === "ready" || isAlreadyPaid;
            
            const updates: any = {
                deposit_paid: true,
                deposit_amount: total,
                updated_at: new Date().toISOString()
            };

            if (shouldComplete) {
                updates.status = "completed";
                updates.completed_at = new Date().toISOString();
            }

            const { error } = await adminDb("restaurant_orders")
                .update(updates)
                .eq("id", order.id);

            if (error) throw error;

            const msgText = shouldComplete
                ? `La commande #${order.order_number} a ǸtǸ validǸe et clturǸe avec succs !`
                : `Le paiement de la commande #${order.order_number} a ǸtǸ enregistrǸ ! (En cours de prǸparation en cuisine)`;

            setMessage({ type: 'success', text: msgText });
            setOrder(null);
            setSearchQuery("");
            fetchDailySummary(); // Refresh summary
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Erreur lors de l'encaissement." });
        } finally {
            setLoading(false);
        }
    };
'''

c_replacement = '''
    const handleConfirmPayment = async () => {
        if (!order) return;
        setLoading(true);

        const total = order.total_price || order.subtotal || 0;
        const isAlreadyPaid = order.deposit_paid && (order.deposit_amount >= total);

        try {
            let msgText = "";

            if (order.order_type === "restaurant") {
                const shouldComplete = order.status === "ready" || isAlreadyPaid;
                const updates: any = {
                    deposit_paid: true,
                    deposit_amount: total,
                    updated_at: new Date().toISOString()
                };
    
                if (shouldComplete) {
                    updates.status = "completed";
                    updates.completed_at = new Date().toISOString();
                }
    
                const { error } = await adminDb("restaurant_orders")
                    .update(updates)
                    .eq("id", order.id);
    
                if (error) throw error;
    
                msgText = shouldComplete
                    ? `La commande #${order.order_number} a été validée et clôturée avec succès !`
                    : `Le paiement de la commande #${order.order_number} a été enregistré ! (En cours de préparation en cuisine)`;
            } else {
                const updates: any = {
                    deposit_paid: true,
                    deposit_amount: total
                };
                
                if (order.status === "pending") {
                    updates.status = "confirmed";
                }
                
                const { error } = await adminDb("pool_bookings")
                    .update(updates)
                    .eq("id", order.id);
    
                if (error) throw error;
                
                msgText = `Le paiement du ticket #${order.booking_number || order.id.substring(0,6).toUpperCase()} a été enregistré !`;
            }

            setMessage({ type: 'success', text: msgText });
            setOrder(null);
            setSearchQuery("");
            fetchDailySummary(); // Refresh summary
        } catch (err) {
            console.error(err);
            setMessage({ type: 'error', text: "Erreur lors de l'encaissement." });
        } finally {
            setLoading(false);
        }
    };
'''
c = c.replace(c_target.strip(), c_replacement.strip())

ui_target = '''
                    <div className="bg-[#1E293B] border border-white/10 rounded-[2rem] p-6 space-y-6 shadow-2xl">
                        {/* Header details */}
                        <div className="flex justify-between items-start border-b border-white/5 pb-4">
                            <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Commande</span>
                                <span className="text-xl font-black text-white">#{order.order_number}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Statut Actuel</span>
                                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">{order.status}</span>
                            </div>
                        </div>

                        {/* List items */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Articles CommandǸs</h3>
                            <div className="space-y-3 bg-[#0F172A] border border-white/5 p-4 rounded-2xl">
                                {parseOrder(order.items).foodItems.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-start text-sm">
                                        <div>
                                            <span className="text-green-400 font-black mr-2">x{item.quantity}</span>
                                            <span className="text-white font-bold">{item.name}</span>
                                            {item.meta && <p className="text-[10px] text-gray-400 mt-0.5">{item.meta}</p>}
                                        </div>
                                        <span className="text-gray-300 font-bold">
                                            {((item.price || item.basePrice || 0) * (item.quantity || 1))} DH
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing details */}
'''

ui_replacement = '''
                    <div className="bg-[#1E293B] border border-white/10 rounded-[2rem] p-6 space-y-6 shadow-2xl">
                        {/* Header details */}
                        <div className="flex justify-between items-start border-b border-white/5 pb-4">
                            <div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">{order.order_type === 'pool' ? 'Piscine' : 'Commande'}</span>
                                <span className="text-xl font-black text-white">#{order.order_number || order.booking_number || order.id.substring(0,6).toUpperCase()}</span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Statut Actuel</span>
                                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">{order.status}</span>
                            </div>
                        </div>

                        {/* List items */}
                        {order.order_type === 'restaurant' && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Articles Commandés</h3>
                                <div className="space-y-3 bg-[#0F172A] border border-white/5 p-4 rounded-2xl">
                                    {parseOrder(order.items).foodItems.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between items-start text-sm">
                                            <div>
                                                <span className="text-green-400 font-black mr-2">x{item.quantity}</span>
                                                <span className="text-white font-bold">{item.name}</span>
                                                {item.meta && <p className="text-[10px] text-gray-400 mt-0.5">{item.meta}</p>}
                                            </div>
                                            <span className="text-gray-300 font-bold">
                                                {((item.price || item.basePrice || 0) * (item.quantity || 1))} DH
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {order.order_type === 'pool' && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Détails Billet Piscine</h3>
                                <div className="space-y-3 bg-[#0F172A] border border-white/5 p-4 rounded-2xl">
                                    <div className="flex justify-between items-start text-sm">
                                        <div>
                                            <span className="text-green-400 font-black mr-2">Formule</span>
                                            <span className="text-white font-bold">{order.formula === "morning" ? "Matinée" : order.formula === "afternoon" ? "Après-Midi" : "Journée Complète"}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-start text-sm">
                                        <div>
                                            <span className="text-green-400 font-black mr-2">Personnes</span>
                                            <span className="text-white font-bold">{order.adults} Adulte(s), {order.children} Enfant(s)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pricing details */}
'''
c = c.replace(ui_target.strip(), ui_replacement.strip())

# Fix artifacts
c = c.replace('CommandǸs', 'Commandés')
c = c.replace('Acompte PayǸ', 'Acompte Payé')
c = c.replace('Non PayǸ', 'Non Payé')
c = c.replace('Net Reste ? Payer', 'Net Reste À Payer')
c = c.replace('DǸj PayǸe', 'Déjà Payée')
c = c.replace('tǸlǸphone', 'téléphone')
c = c.replace('Rglement', 'Règlement')
c = c.replace('clturǸe', 'clôturée')
c = c.replace('succs', 'succès')
c = c.replace('enregistrǸ', 'enregistré')
c = c.replace('prǸparation', 'préparation')

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated caisse logic fully.")
