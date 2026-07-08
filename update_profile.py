import re

path = 'app/profile/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add dynamic import
if "import dynamic from 'next/dynamic';" not in c:
    c = c.replace("import Image from 'next/image';", "import Image from 'next/image';\nimport dynamic from 'next/dynamic';\n\nconst Scanner = dynamic(() => import('@yudiel/react-qr-scanner').then(mod => mod.Scanner), { ssr: false });\n")

# Add state
if "isScanningArrival" not in c:
    c = c.replace("const [selectedOrder, setSelectedOrder] = useState<any | null>(null);", "const [selectedOrder, setSelectedOrder] = useState<any | null>(null);\n    const [isScanningArrival, setIsScanningArrival] = useState<string | null>(null);\n")

# Add handleArrivalScan function
arrival_fn = '''
    const handleArrivalScan = async (result: any) => {
        if (!result || result.length === 0 || !isScanningArrival) return;
        const code = result[0].rawValue.trim();
        
        try {
            const res = await fetch('/api/orders/arrive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: isScanningArrival, tableCode: code })
            });
            if (res.ok) {
                alert("Votre arrivǸe a ǸtǸ signalǸe avec succs !");
                setIsScanningArrival(null);
                fetchUserOrders(); // refresh
            } else {
                alert("Erreur lors de la signalisation. Code invalide ?");
            }
        } catch (err) {
            console.error(err);
        }
    };
'''
if "handleArrivalScan" not in c:
    c = c.replace("const fetchUserOrders = useCallback(async () => {", arrival_fn + "\n    const fetchUserOrders = useCallback(async () => {")

# Add the button in the order card
button_html = '''
                                                {isWay && (order.status === "pending" || order.status === "confirmed" || order.status === "preparing") && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsScanningArrival(order.id);
                                                        }}
                                                        className="w-full mt-3 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <QrCode className="w-4 h-4" />
                                                        Je suis arrivǸ (Scanner la table)
                                                    </button>
                                                )}
'''

# Find the end of the location_type check block to insert the button
# We'll inject it just after the View QR code block
target_inject = '''                                              {/* Edit Button (Pencil) */}'''
if "Je suis arriv" not in c:
    c = c.replace(target_inject, button_html + "\n" + target_inject)

# Add the Scanner Modal at the bottom
scanner_modal = '''
            {/* Arrival Scanner Modal */}
            {isScanningArrival && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsScanningArrival(null)} />
                    <div className="bg-[#1E293B] rounded-3xl w-full max-w-sm relative z-10 p-6 border border-white/10 shadow-2xl">
                        <button
                            onClick={() => setIsScanningArrival(null)}
                            className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-black text-white mb-2">Scanner la table</h3>
                            <p className="text-gray-400 text-sm">Scannez le QR code de la table ou de l'emplacement pour signaler votre arrivǸe.</p>
                        </div>

                        <div className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-blue-500/50 shadow-2xl relative bg-black">
                            <Scanner onScan={handleArrivalScan} />
                        </div>
                    </div>
                </div>
            )}
'''

if "Arrival Scanner Modal" not in c:
    c = c.replace("{/* QR Modal */}", scanner_modal + "\n            {/* QR Modal */}")

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print("Updated Profile for Arrival Scan.")
