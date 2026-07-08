import re

path = 'app/staff/restaurant/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Enhance ticket layout
old_print_fn_regex = r'const handlePrintTicket = \(order: any, foodItems: any\[\], meta: any\) => \{.*?    \};\n'
new_print_fn = '''const handlePrintTicket = (order: any, foodItems: any[], meta: any) => {
        const printContent = `
            <div style="font-family: 'Courier New', Courier, monospace; max-width: 300px; margin: 0 auto; color: #000; padding: 10px; background: #fff;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h2 style="margin: 0; font-size: 24px; text-transform: uppercase;">GOLDEN PARC</h2>
                    <p style="margin: 5px 0; font-size: 14px;">Ticket Cuisine</p>
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
                
                <div style="text-align: center; margin-top: 20px; font-size: 12px;">
                    <p>MERCI ET BON COURAGE !</p>
                    <p>Golden Parc Cepsa</p>
                </div>
            </div>
        `;
        
        const printWindow = window.open('', '', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(`
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
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };
'''

c = re.sub(old_print_fn_regex, new_print_fn, c, flags=re.DOTALL)

# Remove "Servi & EncaissǸ" button logic
encaisser_button_regex = r'\{order\.status === "ready" && \(\s*<button\s*onClick=\{.*?updateOrderStatus\(order\.id, "completed"\).*?>\s*Servi & EncaissǸ\s*</button>\s*\)\}'
c = re.sub(encaisser_button_regex, '', c, flags=re.DOTALL)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print("Updated Kitchen flow and ticket printing.")
