import re

path = 'app/staff/restaurant/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Add Print button
button_inject = '''<div className="flex gap-2">
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
'''
c = c.replace('<div className="flex gap-2">', button_inject, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print("Injected print button.")
