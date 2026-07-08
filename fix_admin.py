import re

path = 'app/admin/restaurant/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the first instance of parseOrder
target = '''
    const parseOrder = (orderItems: any[]) => {
        if (!Array.isArray(orderItems)) return { foodItems: [], meta: {} };
        const foodItems = orderItems.filter(item => !item.is_meta);
        const metaItem = orderItems.find(item => item.is_meta) || {};
        return { foodItems, meta: metaItem };
    };
'''

c = c.replace(target, "", 1) # Replace only the first occurrence

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)

print("Removed duplicate parseOrder.")
