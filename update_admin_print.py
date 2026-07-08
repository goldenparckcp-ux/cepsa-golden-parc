import re

path = 'app/admin/restaurant/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add Printer to lucide-react imports if not there
if 'Printer' not in c:
    c = c.replace('import { Utensils,', 'import { Utensils, Printer,')

# Add parseOrder function
parseOrder_fn = '''
    const parseOrder = (orderItems: any[]) => {
        if (!Array.isArray(orderItems)) return { foodItems: [], meta: {} };
        const foodItems = orderItems.filter(item => !item.is_meta);
        const metaItem = orderItems.find(item => item.is_meta) || {};
        return { foodItems, meta: metaItem };
    };
'''

# Add handlePrintTicket function
print_fn = '''
    const handlePrintTicket = (order: any, foodItems: any[], meta: any) => {
        const totalAmount = order.total_amount || order.total || order.amount || foodItems.reduce((acc, item) => acc + (item.price * item.quantity || 0), 0);
        const deposit = order.deposit_amount || 0;
        const remaining = totalAmount - deposit;
        
        const printContent = `
            <div style="font-family: 'Courier New', Courier, monospace; max-width: 300px; margin: 0 auto; color: #000; padding: 10px; background: #fff;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h2 style="margin: 0; font-size: 24px; text-transform: uppercase;">GOLDEN PARK STATION</h2>
                    <p style="margin: 5px 0; font-size: 14px;">Ticket Cuisine / Caisse</p>
                    <p style="margin: 5px 0; font-size: 14px; border-bottom: 2px dashed #000; padding-bottom: 10px;">${new Date(order.created_at).toLocaleString('fr-FR')}</p>
                </div>
                
                <div style="margin-bottom: 15px; font-size: 16px;">
                    <h1 style="text-align: center; margin: 5px 0; font-size: 32px; border: 2px solid #000; padding: 5px;">#${order.order_number}</h1>
                    <p style="margin: 5px 0;"><strong>Type:</strong> ${meta.location_type === "on_way" ? "EN ROUTE / DRIVE" : "SUR PLACE"}</p>
                    ${meta.table_number ? `<p style="margin: 5px 0; font-size: 20px; font-weight: bold;"><strong>Emplacement:</strong> ${meta.table_number}</p>` : ""}
                    ${meta.arrival_time ? `<p style="margin: 5px 0;"><strong>Arrivée prévue:</strong> ${meta.arrival_time}</p>` : ""}
                    ${order.customer_name ? `<p style="margin: 5px 0;"><strong>Client:</strong> ${order.customer_name}</p>` : ""}
                    ${order.customer_phone ? `<p style="margin: 5px 0;"><strong>Tel:</strong> ${order.customer_phone}</p>` : ""}
                </div>

                <div style="border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 10px 0; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 18px; text-align: center;">--- COMMANDES ---</h3>
                    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid #000; text-align: left;">
                            <th style="padding-bottom: 5px; width: 25px;">Qt</th>
                            <th style="padding-bottom: 5px;">Article</th>
                            <th style="padding-bottom: 5px; text-align: right;">PU</th>
                            <th style="padding-bottom: 5px; text-align: right;">Tot</th>
                        </tr>
                        ${foodItems.map(item => `
                            <tr>
                                <td style="vertical-align: top; font-weight: bold; padding-top: 5px;">${item.quantity}</td>
                                <td style="padding-top: 5px;">
                                    <strong>${item.name}</strong>
                                    ${item.options ? `<br/><span style="font-size: 11px;">- ${item.options.replace(/\\|/g, ', ')}</span>` : ""}
                                    ${item.special_instructions ? `<br/><span style="font-size: 11px; font-weight: bold;">* ${item.special_instructions}</span>` : ""}
                                </td>
                                <td style="vertical-align: top; text-align: right; padding-top: 5px;">${item.price.toFixed(2)}</td>
                                <td style="vertical-align: top; text-align: right; font-weight: bold; padding-top: 5px;">${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>

                <div style="margin-bottom: 20px; font-size: 16px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="text-align: left; padding: 3px 0;">TOTAL:</td>
                            <td style="text-align: right; font-weight: bold; font-size: 18px;">${totalAmount.toFixed(2)} DH</td>
                        </tr>
                        ${deposit > 0 ? `
                        <tr>
                            <td style="text-align: left; padding: 3px 0; color: #555;">AVANCE PAYÉE:</td>
                            <td style="text-align: right; color: #555;">-${deposit.toFixed(2)} DH</td>
                        </tr>
                        <tr>
                            <td style="text-align: left; padding: 5px 0; font-weight: bold; font-size: 18px;">RESTE À PAYER:</td>
                            <td style="text-align: right; font-weight: bold; font-size: 20px;">${Math.max(0, remaining).toFixed(2)} DH</td>
                        </tr>
                        ` : ''}
                        ${order.status === "completed" || (deposit >= totalAmount && totalAmount > 0) ? `
                        <tr>
                            <td colspan="2" style="text-align: center; padding: 10px 0; font-weight: bold; font-size: 20px; border: 2px dashed #000; margin-top: 10px;">
                                DÉJÀ PAYÉ
                            </td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order.order_number}" alt="QR Code Caisse" style="width: 120px; height: 120px;" />
                    <p style="font-size: 12px; margin-top: 5px;">Scanner pour valider</p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; font-size: 12px;">
                    <p>MERCI ET BON COURAGE !</p>
                    <p>Golden Park Station</p>
                </div>
            </div>
        `;
        
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);
        
        const doc = iframe.contentWindow?.document;
        if (doc) {
            doc.open();
            doc.write(`
                <html>
                    <head>
                        <title>Ticket Cuisine #${order.order_number}</title>
                        <style>
                            @page { margin: 0; size: 80mm 297mm; }
                            body { margin: 0; padding: 0; background: #fff; }
                        </style>
                    </head>
                    <body>${printContent}</body>
                </html>
            `);
            doc.close();
            
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 500);
        }
    };
'''

if 'handlePrintTicket' not in c:
    c = c.replace('const updateOrderStatus = async', parseOrder_fn + '\n' + print_fn + '\n\n    const updateOrderStatus = async')

c = c.replace('''const orderItems = order.items || [];
                                const isEnRoute = orderItems.some((i: any) => i.is_meta && i.location_type === "on_way");''',
'''const { foodItems, meta } = parseOrder(order.items || []);
                                const isEnRoute = meta.location_type === "on_way";''')

c = c.replace('const totalItems = orderItems.length;', 'const totalItems = foodItems.length;')

c = c.replace('''<div className="flex gap-2">
                                        {(order.status === "pending" || order.status === "confirmed") && (''',
'''<div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePrintTicket(order, foodItems, meta);
                                            }}
                                            className="p-3 bg-gray-500/10 border border-gray-500/20 hover:bg-gray-500/20 text-gray-400 font-bold text-xs rounded-xl transition-all"
                                            title="Imprimer"
                                        >
                                            <Printer className="w-5 h-5" />
                                        </button>

                                        {(order.status === "pending" || order.status === "confirmed") && (''')

# Replace the completed block for ready status
c = c.replace('''{order.status === "ready" && (
                                            <>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, "completed")}
                                                    className="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Check className="w-4 h-4 shrink-0" />
                                                    Servi & EncaissǸ
                                                </button>
                                            </>
                                        )}''',
'''{order.status === "ready" && (
                                            <div className="w-full bg-[#0F172A] border border-white/5 rounded-xl py-3 text-center text-xs text-amber-500 font-bold animate-pulse">
                                                En attente d'encaissement (Caisse)
                                            </div>
                                        )}''')
                                        
# Also fix the weird characters in Caisse / Admin
c = c.replace('Servi & EncaissǸ', 'Servi & Encaissé')
c = c.replace('o. Commande TerminǸe', '✓ Commande Terminée')
c = c.replace('?O Commande AnnulǸe', '✕ Commande Annulée')
c = c.replace('PrǦt ! (Pris en Charge)', 'Prêt ! (Pris en Charge)')


with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Admin ticket logic updated.")
