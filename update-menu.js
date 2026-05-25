const fs = require('fs');
let c = fs.readFileSync('lib/types/menu.ts', 'utf8');

c = c.replace(
    /\{\s*id:\s*"mayo",\s*label:\s*"Mayonnaise"\s*\}\s*\]\s*\}\s*\}/m,
    `{ id: "mayo", label: "Mayonnaise" }
                ]
            },
            extras: {
                label: "Suppléments",
                type: "checkbox",
                options: [
                    { id: "extra_sauce", label: "Extra Sauce", price: 2 },
                    { id: "extra_fromage", label: "Extra Fromage", price: 5 },
                    { id: "extra_frites", label: "Frites Supplémentaires", price: 10 },
                    { id: "extra_viande", label: "Double Viande", price: 12 }
                ]
            }
        }`
);

c = c.replace(
    /\{\s*id:\s*"thon",\s*label:\s*"Thon \(\+5 DH\)",\s*price:\s*5\s*\}\s*\]\s*,\s*default:\s*"fromage"\s*\}\s*\}/m,
    `{ id: "thon", label: "Thon (+5 DH)", price: 5 }
                ],
                default: "fromage"
            },
            extras: {
                label: "Suppléments",
                type: "checkbox",
                options: [
                    { id: "extra_sauce", label: "Extra Sauce", price: 2 },
                    { id: "extra_fromage", label: "Extra Fromage", price: 5 },
                    { id: "extra_frites", label: "Frites Supplémentaires", price: 10 }
                ]
            }
        }`
);

c = c.replace(
    /\{\s*id:\s*"l",\s*label:\s*"Familiale \(Grand Format\)",\s*price:\s*30\s*\}\s*\]\s*,\s*default:\s*"s"\s*\}\s*\}/m,
    `{ id: "l", label: "Familiale (Grand Format)", price: 30 }
                ],
                default: "s"
            },
            extras: {
                label: "Suppléments",
                type: "checkbox",
                options: [
                    { id: "extra_fromage", label: "Double Fromage", price: 10 },
                    { id: "extra_olive", label: "Extra Olives", price: 3 },
                    { id: "extra_sauce", label: "Extra Sauce Piquante", price: 2 }
                ]
            }
        }`
);

fs.writeFileSync('lib/types/menu.ts', c);
console.log("Updated!");
