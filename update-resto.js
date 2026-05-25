const fs = require('fs');
let c = fs.readFileSync('app/restaurant/page.tsx', 'utf8');

c = c.replace(
    'import { Plus, UtensilsCrossed, ChevronRight, Trash2, Clock, Check } from "lucide-react";',
    'import { Plus, UtensilsCrossed, ChevronRight, Trash2, Clock, Check, Car } from "lucide-react";'
);

c = c.replace(
    /const \[orderType, setOrderType\] = useState\<'takeout' \| 'dine_in'\>\('takeout'\);/,
    "const [orderType, setOrderType] = useState<'takeout' | 'dine_in' | 'drive_in'>('takeout');"
);

c = c.replace(
    /const \[tableNumber, setTableNumber\] = useState\(""\);/,
    "const [tableNumber, setTableNumber] = useState(\"\");\n    const [carInfo, setCarInfo] = useState(\"\");"
);

c = c.replace(
    /setCustomMinutes\(''\);\s*setTableNumber\(''\);/,
    "setCustomMinutes('');\n                setTableNumber('');\n                setCarInfo('');"
);

c = c.replace(
    /table_number:\s*orderType === 'dine_in' \? tableNumber : null,\s*customer_notes:\s*"",/,
    "table_number: orderType === 'dine_in' ? tableNumber : null,\n            car_info: orderType === 'drive_in' ? carInfo : null,\n            customer_notes: \"\","
);

c = c.replace(
    /\[arrivalTime, orderType, showCustomTime, customHours, customMinutes, tableNumber, items, total, clear\]\);/g,
    "[arrivalTime, orderType, showCustomTime, customHours, customMinutes, tableNumber, carInfo, items, total, clear]);"
);

c = c.replace(
    /if \(orderType === 'dine_in' && !tableNumber\) \{\s*alert\("Veuillez entrer votre numéro de table"\);\s*return;\s*\}/,
    `if (orderType === 'dine_in' && !tableNumber) {
            alert("Veuillez entrer votre numéro de table");
            return;
        }

        if (orderType === 'drive_in' && !carInfo) {
            alert("Veuillez entrer votre plaque d'immatriculation ou N° de pompe");
            return;
        }`
);

c = c.replace(
    /\{\/\* Toggle: On The Way vs Dine In \*\/\}\s*\<div className="grid grid-cols-2 bg-\[\#1E293B\] p-1 rounded-xl mb-6 border border-white\/10"\>/,
    `{/* Toggle: On The Way vs Dine In vs Drive In */}
                            <div className="grid grid-cols-3 bg-[#1E293B] p-1 rounded-xl mb-6 border border-white/10 gap-1">`
);

c = c.replace(
    /\{t\('restaurant\.cart\.dinein'\)\}\s*\<\/button\>\s*\<\/div\>/,
    `{t('restaurant.cart.dinein')}
                                </button>
                                <button
                                    onClick={() => setOrderType('drive_in')}
                                    className={\`py-3 rounded-lg font-bold text-xs flex flex-col items-center gap-1 transition-all \${orderType === 'drive_in'
                                        ? 'bg-red-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white'
                                        }\`}
                                >
                                    <Car className="w-4 h-4" />
                                    À la voiture
                                </button>
                            </div>`
);

c = c.replace(
    /\}\s*\<\/>\s*\)\s*:\s*\(\s*\<\>/,
    `}
                                    </>
                                ) : orderType === 'drive_in' ? (
                                    <>
                                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <Car className="w-4 h-4 text-gray-400" /> Informations Voiture
                                        </h3>
                                        <input
                                            type="text"
                                            value={carInfo}
                                            onChange={(e) => setCarInfo(e.target.value)}
                                            placeholder="Plaque ou N° Pompe"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold text-xl text-center outline-none focus:border-red-500"
                                        />
                                    </>
                                ) : (
                                    <>`
);

c = c.replace(
    /src=\{item\.image\}/g,
    'src={item.image || "/image/cepsa-hero.jpg"}'
);

fs.writeFileSync('app/restaurant/page.tsx', c);
console.log("Restaurant Updated!");
