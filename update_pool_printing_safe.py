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
        if 'const handleCheckIn' in c:
            c = c.replace('const handleCheckIn', print_fn + '\n\n    const handleCheckIn')
        elif 'const updateBookingStatus' in c:
            c = c.replace('const updateBookingStatus', print_fn + '\n\n    const updateBookingStatus')

    # Add the print button UI.
    
    # We find `<div className="border-t border-white/5 mt-4 pt-4">`
    # and replace it with a flex container that will hold the print button.
    # Wait, the buttons are stacked vertically right now if there's multiple (e.g. pending has a Valider l'Entree button).
    # We can just wrap the content of `border-t border-white/5 mt-4 pt-4` in a div or just put the print button as the first child of it, making the container a flex column, or flex row with gap.
    # The existing container is:
    # <div className="border-t border-white/5 mt-4 pt-4">
    #     {b.status === "pending" && (
    
    # Let's do:
    # <div className="border-t border-white/5 mt-4 pt-4 flex gap-2">
    #     <button onClick={(e) => { e.stopPropagation(); handlePrintTicket(b); }} className="px-4 py-3 bg-gray-500/10 border border-gray-500/20 hover:bg-gray-500/20 text-gray-400 font-bold rounded-xl transition-all flex items-center justify-center" title="Imprimer"><Printer className="w-5 h-5" /></button>
    #     <div className="flex-1">
    #       ... existing buttons ...
    #     </div>
    # </div>
    
    # The existing block starts with:
    # <div className="border-t border-white/5 mt-4 pt-4">
    
    # It ends with the closing div just after the `b.status === "completed" || ...` check.
    # But doing this safely with replace is tricky. Let's just insert the print button directly inside the existing `border-t` div, but since we want them side-by-side...
    # We can just add flex and gap-2 to the `border-t` div, and make sure all children fill the remaining space except the print button.
    
    target_div = '<div className="border-t border-white/5 mt-4 pt-4">'
    replacement_div = '''<div className="border-t border-white/5 mt-4 pt-4 flex gap-2">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handlePrintTicket(b); }}
                                            className="px-4 bg-gray-500/10 border border-gray-500/20 hover:bg-gray-500/20 text-gray-400 font-bold rounded-xl transition-all flex items-center justify-center shrink-0"
                                            title="Imprimer"
                                        >
                                            <Printer className="w-5 h-5" />
                                        </button>
                                        <div className="flex-1">'''
                                        
    c = c.replace(target_div, replacement_div)

    # Now we must close the `<div className="flex-1">` that we just opened.
    # The div closes after `Annulé"} </div> )}`
    
    # In both admin and staff, it's roughly:
    # {(b.status === "completed" || b.status === "cancelled") && (
    #     <div className="...">
    #         {b.status === "completed" ? "✓ Ticket Historisé" : "✕ Ticket Annulé"}
    #     </div>
    # )}
    # </div>
    
    # We can replace `</div>\n                            </div>\n                        ))}`
    # Wait, the structure is:
    # </div> <!-- closes border-t -->
    # </div> <!-- closes the booking card -->
    # ))}
    
    # So we replace:
    # </div>
    # </div>
    # ))}
    # With:
    # </div>
    # </div>
    # </div>
    # ))}
    
    if "admin" in path:
        # Admin is:
        #                 </div>
        #             </div>
        #         );
        #     })}
        # </div>
        end_target = '''                                </div>
                            </div>
                        );
                    })}'''
        end_repl = '''                                    </div>
                                </div>
                            </div>
                        );
                    })}'''
        c = c.replace(end_target, end_repl)
    else:
        # Staff is:
        #                 </div>
        #             </div>
        #         ))}
        #     </div>
        end_target = '''                                </div>
                            </div>
                        ))}'''
        end_repl = '''                                    </div>
                                </div>
                            </div>
                        ))}'''
        c = c.replace(end_target, end_repl)

    c = c.replace('o. Ticket HistorisǸ', '✓ Ticket Historisé')
    c = c.replace('?O Ticket AnnulǸ', '✕ Ticket Annulé')
    c = c.replace('MatinǸe', 'Matinée')
    c = c.replace('Aprs-Midi', 'Après-Midi')
    c = c.replace('JournǸe Complte', 'Journée Complète')
    c = c.replace('Valider l\'EntrǸe', 'Valider l\'Entrée')
    c = c.replace('ValidǸ', 'Validé')
    c = c.replace('-?', '✓')
    c = c.replace('o.', '✓')
    c = c.replace('?O', '✕')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    
    print(f"Updated {path}")

update_file('app/staff/pool-services/page.tsx')
update_file('app/admin/pool-services/page.tsx')
