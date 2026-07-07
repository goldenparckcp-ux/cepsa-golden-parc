import re

path = 'app/staff/restaurant/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add lucide icon Printer
c = c.replace('import { Utensils, Clock, Check, Bell, BellOff, Search, Table, Navigation, LogOut } from "lucide-react";',
              'import { Utensils, Clock, Check, Bell, BellOff, Search, Table, Navigation, LogOut, Printer } from "lucide-react";')

# Add handlePrintTicket function
print_fn = '''
    const handlePrintTicket = (order: any, foodItems: any[], meta: any) => {
        const printContent = `
            <div style="font-family: monospace; padding: 20px; max-width: 300px; margin: auto;">
                <h2 style="text-align: center; margin: 0 0 10px 0;">GOLDEN PARC CUISINE</h2>
                <hr style="border-top: 1px dashed black;" />
                <p><strong>Cmd:</strong> #${order.order_number}</p>
                <p><strong>Heure:</strong> ${new Date(order.created_at).toLocaleTimeString()}</p>
                <p><strong>Type:</strong> ${meta.location_type === "on_way" ? "Sur la route" : "Sur place"}</p>
                ${meta.table_number ? `<p><strong>Table:</strong> ${meta.table_number}</p>` : ""}
                ${meta.arrival_time ? `<p><strong>Arrivée prévue:</strong> ${meta.arrival_time}</p>` : ""}
                ${order.customer_name ? `<p><strong>Client:</strong> ${order.customer_name}</p>` : ""}
                ${order.customer_phone ? `<p><strong>Tel:</strong> ${order.customer_phone}</p>` : ""}
                <hr style="border-top: 1px dashed black;" />
                <h3 style="margin: 10px 0;">ARTICLES :</h3>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${foodItems.map(item => `
                        <li style="margin-bottom: 8px;">
                            <strong>${item.quantity}x ${item.name}</strong>
                            ${item.options ? `<br/><small style="margin-left: 10px;">${item.options.replace(/\\|/g, ', ')}</small>` : ""}
                            ${item.special_instructions ? `<br/><small style="margin-left: 10px;">* ${item.special_instructions}</small>` : ""}
                        </li>
                    `).join('')}
                </ul>
                <hr style="border-top: 1px dashed black;" />
            </div>
        `;
        
        const printWindow = window.open('', '', 'width=400,height=600');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head><title>Ticket Cuisine #${order.order_number}</title></head>
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

c = re.sub(r'    const parseOrder = \(orderItems: any\[\]\) => \{', print_fn + '\n    const parseOrder = (orderItems: any[]) => {', c)

# Add Print button
button_inject = '''
                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePrintTicket(order, foodItems, meta);
                                                    }}
                                                    className="p-2 rounded-xl bg-gray-500/10 text-gray-400 hover:bg-gray-500 hover:text-white transition-all flex items-center justify-center flex-1"
                                                    title="Imprimer le ticket pour la cuisine"
                                                >
                                                    <Printer className="w-5 h-5" />
                                                </button>
'''
c = c.replace('{/* Action Buttons */}', button_inject)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print("Added print functionality to restaurant page.")
