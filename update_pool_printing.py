import re

def update_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()

    # Add Printer to lucide-react imports if not there
    if 'Printer' not in c:
        c = re.sub(r'import \{ ([^}]+) \} from "lucide-react";', r'import { \1, Printer } from "lucide-react";', c)

    print_fn = '''
    const handlePrintTicket = (booking: any) => {
        const getFormulaLabel = (f: string) => {
            if (f === "morning") return "Matinée";
            if (f === "afternoon") return "Après-Midi";
            return "Journée Complète";
        };
        
        const formulaLabel = getFormulaLabel(booking.formula);
        const totalAmount = booking.total_price || 0;
        
        const printContent = `
            <div style="font-family: 'Courier New', Courier, monospace; max-width: 300px; margin: 0 auto; color: #000; padding: 10px; background: #fff;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <h2 style="margin: 0; font-size: 24px; text-transform: uppercase;">GOLDEN PARK STATION</h2>
                    <p style="margin: 5px 0; font-size: 14px;">Ticket Piscine / Services</p>
                    <p style="margin: 5px 0; font-size: 14px; border-bottom: 2px dashed #000; padding-bottom: 10px;">${new Date(booking.created_at).toLocaleString('fr-FR')}</p>
                </div>
                
                <div style="margin-bottom: 15px; font-size: 16px;">
                    <h1 style="text-align: center; margin: 5px 0; font-size: 32px; border: 2px solid #000; padding: 5px;">#${booking.booking_number || booking.id.substring(0,6).toUpperCase()}</h1>
                    <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(booking.booking_date).toLocaleDateString('fr-FR')}</p>
                    <p style="margin: 5px 0;"><strong>Formule:</strong> ${formulaLabel}</p>
                    ${booking.customer_name ? `<p style="margin: 5px 0;"><strong>Client:</strong> ${booking.customer_name}</p>` : ""}
                    ${booking.customer_phone ? `<p style="margin: 5px 0;"><strong>Tel:</strong> ${booking.customer_phone}</p>` : ""}
                </div>

                <div style="border-top: 2px dashed #000; border-bottom: 2px dashed #000; padding: 10px 0; margin-bottom: 15px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 18px; text-align: center;">--- ENTRÉES ---</h3>
                    <table style="width: 100%; font-size: 16px; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 5px 0;">Adultes :</td>
                            <td style="text-align: right; font-weight: bold;">${booking.adults}</td>
                        </tr>
                        <tr>
                            <td style="padding: 5px 0;">Enfants :</td>
                            <td style="text-align: right; font-weight: bold;">${booking.children}</td>
                        </tr>
                    </table>
                </div>

                <div style="margin-bottom: 20px; font-size: 16px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="text-align: left; padding: 3px 0;">TOTAL:</td>
                            <td style="text-align: right; font-weight: bold; font-size: 20px;">${Number(totalAmount).toFixed(2)} DH</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="text-align: center; padding: 10px 0; font-weight: bold; font-size: 20px; border: 2px dashed #000; margin-top: 10px;">
                                DÉJÀ PAYÉ
                            </td>
                        </tr>
                    </table>
                </div>
                
                <div style="text-align: center; margin: 20px 0;">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${booking.booking_number || booking.id}" alt="QR Code Piscine" style="width: 120px; height: 120px;" />
                    <p style="font-size: 12px; margin-top: 5px;">Billet Accès Piscine</p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; font-size: 12px;">
                    <p>MERCI DE VOTRE VISITE !</p>
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
                        <title>Ticket Piscine #${booking.booking_number || booking.id}</title>
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
        # insert before handleCheckIn or handleSearch
        if 'const handleCheckIn' in c:
            c = c.replace('const handleCheckIn', print_fn + '\n\n    const handleCheckIn')
        elif 'const updateBookingStatus' in c:
            c = c.replace('const updateBookingStatus', print_fn + '\n\n    const updateBookingStatus')

    # Now add the print button in the UI
    # Find the actions div and inject the print button
    
    # In staff:
    staff_btn = '''
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePrintTicket(b);
                                            }}
                                            className="p-3 bg-gray-500/10 border border-gray-500/20 hover:bg-gray-500/20 text-gray-400 font-bold text-xs rounded-xl transition-all"
                                            title="Imprimer"
                                        >
                                            <Printer className="w-5 h-5" />
                                        </button>
                                        
                                        {b.status === "pending" && (
'''

    c = c.replace('''{b.status === "pending" && (''', staff_btn)
    
    # In staff we opened a <div className="flex gap-2"> that needs to be closed.
    # We can just close it after the conditional blocks.
    # Wait, it's safer to just wrap all the action buttons in the flex.
    
    # Let's write a safer UI replacement using regex.
    # The actions area usually looks like:
    # <div className="border-t border-white/5 mt-4 pt-4">
    #     {b.status === "pending" && ( ...
    
    regex = r'(<div className="border-t border-white/5 mt-4 pt-4[^"]*">)'
    
    c = re.sub(regex, r'\1\n                                    <div className="flex gap-2">\n                                        <button onClick={(e) => { e.stopPropagation(); handlePrintTicket(b); }} className="px-4 bg-gray-500/10 border border-gray-500/20 hover:bg-gray-500/20 text-gray-400 font-bold rounded-xl transition-all" title="Imprimer"><Printer className="w-5 h-5" /></button>\n', c)

    # Now we need to close the div we opened!
    c = c.replace('''                                    {(b.status === "completed" || b.status === "cancelled") && (
                                        <div className="w-full bg-[#0F172A] border border-white/5 rounded-xl py-2.5 text-center text-xs text-gray-500 font-bold">
                                            {b.status === "completed" ? "✓ Ticket Historisé" : "✕ Ticket Annulé"}
                                        </div>
                                    )}
                                </div>''',
'''                                    {(b.status === "completed" || b.status === "cancelled") && (
                                        <div className="w-full bg-[#0F172A] border border-white/5 rounded-xl py-2.5 text-center text-xs text-gray-500 font-bold">
                                            {b.status === "completed" ? "✓ Ticket Historisé" : "✕ Ticket Annulé"}
                                        </div>
                                    )}
                                    </div>
                                </div>''')
                                
    c = c.replace('o. Ticket HistorisǸ', '✓ Ticket Historisé')
    c = c.replace('?O Ticket AnnulǸ', '✕ Ticket Annulé')
    c = c.replace('MatinǸe', 'Matinée')
    c = c.replace('Aprs-Midi', 'Après-Midi')
    c = c.replace('JournǸe Complte', 'Journée Complète')
    c = c.replace('Valider l\'EntrǸe', 'Valider l\'Entrée')
    c = c.replace('ValidǸ', 'Validé')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    
    print(f"Updated {path}")

update_file('app/staff/pool-services/page.tsx')
update_file('app/admin/pool-services/page.tsx')

