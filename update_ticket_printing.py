import re

path = 'app/staff/restaurant/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

new_print_fn = '''
    const handlePrintTicket = (order: any, foodItems: any[], meta: any) => {
        // Calcul du total si order.total_amount n'est pas prǸsent
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
                    ${meta.arrival_time ? `<p style="margin: 5px 0;"><strong>ArrivǸe prǸvue:</strong> ${meta.arrival_time}</p>` : ""}
                    ${order.customer_name ? `<p style="margin: 5px 0;"><strong>Client:</strong> ${order.customer_name}</p>` : ""}
                    ${order.customer_phone ? `<p style="margin: 5px 0;"><strong>Tel:</strong> ${order.customer_phone}</p>` : ""}
                </div>

                <div style="border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 10px 0; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 18px; text-align: center;">--- COMMANDES ---</h3>
                    <table style="width: 100%; font-size: 15px; border-collapse: collapse;">
                        ${foodItems.map(item => `
                            <tr>
                                <td style="vertical-align: top; font-weight: bold; padding-right: 5px; width: 30px;">${item.quantity}x</td>
                                <td>
                                    <strong>${item.name}</strong>
                                    ${item.options ? `<br/><span style="font-size: 12px; margin-left: 5px;">- ${item.options.replace(/\\|/g, ', ')}</span>` : ""}
                                    ${item.special_instructions ? `<br/><span style="font-size: 12px; margin-left: 5px; font-weight: bold;">* ${item.special_instructions}</span>` : ""}
                                </td>
                            </tr>
                            <tr><td colspan="2" style="height: 5px;"></td></tr>
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
                            <td style="text-align: left; padding: 3px 0; color: #555;">AVANCE PAYǸE:</td>
                            <td style="text-align: right; color: #555;">-${deposit.toFixed(2)} DH</td>
                        </tr>
                        <tr>
                            <td style="text-align: left; padding: 5px 0; font-weight: bold; font-size: 18px;">RESTE  PAYER:</td>
                            <td style="text-align: right; font-weight: bold; font-size: 20px;">${Math.max(0, remaining).toFixed(2)} DH</td>
                        </tr>
                        ` : ''}
                        ${order.status === "completed" || (deposit >= totalAmount && totalAmount > 0) ? `
                        <tr>
                            <td colspan="2" style="text-align: center; padding: 10px 0; font-weight: bold; font-size: 20px; border: 2px dashed #000; margin-top: 10px;">
                                DǸJ PAYǸ
                            </td>
                        </tr>
                        ` : ''}
                    </table>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order.id}" alt="QR Code Caisse" style="width: 120px; height: 120px;" />
                    <p style="font-size: 12px; margin-top: 5px;">Scanner pour valider</p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; font-size: 12px;">
                    <p>MERCI ET BON COURAGE !</p>
                    <p>Golden Park Station</p>
                </div>
            </div>
        `;
        
        // Use an invisible iframe for printing to avoid popup windows
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
            
            // Wait a moment for images (like QR code) to load before printing
            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                
                // Remove iframe after printing dialog is closed/done
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 1000);
            }, 500);
        }
    };
'''

regex = r'const handlePrintTicket = \(order: any, foodItems: any\[\], meta: any\) => \{.*?    \};\n'
c = re.sub(regex, new_print_fn + '\n', c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Updated print logic.")
