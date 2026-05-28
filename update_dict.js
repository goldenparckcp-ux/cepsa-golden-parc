const fs = require('fs');
let content = fs.readFileSync('lib/i18n/dictionaries.ts', 'utf8');

// Insert for fr
content = content.replace(/'restaurant\.btn\.view': 'Voir Menu',/, "'restaurant.btn.view': 'Voir Menu',\n        'cart.cancel_policy': 'L\\'annulation doit se faire au moins 45 min à l\\'avance. Des frais (5-10 DH) seront déduits de la garantie.',");

// Insert for ar (assuming ar section has restaurant.btn.view: 'عرض القائمة')
content = content.replace(/'restaurant\.btn\.view': 'عرض القائمة',/, "'restaurant.btn.view': 'عرض القائمة',\n        'cart.cancel_policy': 'الإلغاء يجب أن يكون قبل 45 دقيقة على الأقل. سيتم خصم رسوم (5-10 دراهم) من الضمان.',");

// Insert for en
content = content.replace(/'restaurant\.btn\.view': 'View Menu',/, "'restaurant.btn.view': 'View Menu',\n        'cart.cancel_policy': 'Cancellation must be at least 45 mins in advance. A fee (5-10 DH) will be deducted from the guarantee.',");

// Insert for es
content = content.replace(/'restaurant\.btn\.view': 'Ver Menú',/, "'restaurant.btn.view': 'Ver Menú',\n        'cart.cancel_policy': 'La cancelación debe ser al menos 45 min antes. Se deducirá una tarifa (5-10 DH) de la garantía.',");

fs.writeFileSync('lib/i18n/dictionaries.ts', content, 'utf8');
console.log('Dictionaries updated');
