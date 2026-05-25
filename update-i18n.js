const fs = require('fs');

const path = 'lib/i18n/dictionaries.ts';
let content = fs.readFileSync(path, 'utf8');

// The new keys to add for each language
const newKeys = {
    fr: {
        'cart.where': 'Où êtes-vous ?',
        'cart.onsite': 'Sur Place (Ici)',
        'cart.onway': 'En Route (J\'arrive)',
        'cart.where_exact': 'Où vous livrer exactement ?',
        'cart.loc.table': 'Table (Café/Resto)',
        'cart.loc.pump': 'Pompe / Parking',
        'cart.loc.pool': 'Piscine',
        'cart.loc.room': 'Chambre Hôtel',
        'cart.loc.placeholder': 'Ex: Table 12, Pompe 4, etc.',
        'cart.onsite_note': 'Aucun paiement en ligne requis. Vous paierez à la réception de votre commande.',
        'cart.eta.title': 'Temps d\'arrivée estimé (ETA)',
        'cart.eta.custom': 'Saisir une heure précise',
        'cart.eta.hours': 'Heures',
        'cart.eta.mins': 'Minutes',
        'cart.eta.apply': 'Appliquer',
        'cart.onway_note': 'Pour les commandes "En Route", un pré-paiement ou garantie par carte bancaire sera requis à l\'étape suivante.',
        'cart.btn.onsite': 'Commander Maintenant (Payer sur place)',
        'cart.btn.onway': 'Continuer vers le Paiement (Garantie)',
        'lube.catalog.title': 'Lubrifiants',
        'lube.catalog.sub': 'Comptoir Digital',
        'lube.catalog.hero': 'La Performance Pure',
        'lube.catalog.desc': 'Découvrez notre gamme complète d\'huiles et lubrifiants. Identifiez votre produit et passez le récupérer en station.',
        'lube.search': 'Rechercher une huile (ex: 5W30, Synthétique...)',
        'lube.price_station': 'Prix en station',
        'lube.desc': 'Description',
        'lube.benefits': 'Avantages',
        'lube.avail': 'Disponible en Station',
        'lube.avail.desc': 'Passez au comptoir de la station pour récupérer ce produit. Paiement sur place uniquement.',
        'lube.close': 'Fermer',
        'lube.details': 'Cliquez pour voir les détails'
    },
    en: {
        'cart.where': 'Where are you?',
        'cart.onsite': 'On Site (Here)',
        'cart.onway': 'On the Way (Arriving)',
        'cart.where_exact': 'Where exactly should we deliver?',
        'cart.loc.table': 'Table (Cafe/Resto)',
        'cart.loc.pump': 'Pump / Parking',
        'cart.loc.pool': 'Pool',
        'cart.loc.room': 'Hotel Room',
        'cart.loc.placeholder': 'Ex: Table 12, Pump 4, etc.',
        'cart.onsite_note': 'No online payment required. You will pay upon receiving your order.',
        'cart.eta.title': 'Estimated Time of Arrival (ETA)',
        'cart.eta.custom': 'Enter a specific time',
        'cart.eta.hours': 'Hours',
        'cart.eta.mins': 'Minutes',
        'cart.eta.apply': 'Apply',
        'cart.onway_note': 'For "On the Way" orders, a pre-payment or credit card guarantee will be required in the next step.',
        'cart.btn.onsite': 'Order Now (Pay on site)',
        'cart.btn.onway': 'Continue to Payment (Guarantee)',
        'lube.catalog.title': 'Lubricants',
        'lube.catalog.sub': 'Digital Counter',
        'lube.catalog.hero': 'Pure Performance',
        'lube.catalog.desc': 'Discover our complete range of oils and lubricants. Find your product and pick it up at the station.',
        'lube.search': 'Search for an oil (e.g., 5W30, Synthetic...)',
        'lube.price_station': 'Station Price',
        'lube.desc': 'Description',
        'lube.benefits': 'Benefits',
        'lube.avail': 'Available at the Station',
        'lube.avail.desc': 'Visit the station counter to pick up this product. Payment on site only.',
        'lube.close': 'Close',
        'lube.details': 'Click to view details'
    },
    es: {
        'cart.where': '¿Dónde estás?',
        'cart.onsite': 'En el Lugar (Aquí)',
        'cart.onway': 'En Camino (Llegando)',
        'cart.where_exact': '¿Dónde exactamente deberíamos entregar?',
        'cart.loc.table': 'Mesa (Café/Resto)',
        'cart.loc.pump': 'Bomba / Estacionamiento',
        'cart.loc.pool': 'Piscina',
        'cart.loc.room': 'Habitación de Hotel',
        'cart.loc.placeholder': 'Ej: Mesa 12, Bomba 4, etc.',
        'cart.onsite_note': 'No se requiere pago en línea. Pagará al recibir su pedido.',
        'cart.eta.title': 'Tiempo Estimado de Llegada (ETA)',
        'cart.eta.custom': 'Ingresar una hora específica',
        'cart.eta.hours': 'Horas',
        'cart.eta.mins': 'Minutos',
        'cart.eta.apply': 'Aplicar',
        'cart.onway_note': 'Para pedidos "En Camino", se requerirá un prepago o garantía con tarjeta de crédito en el siguiente paso.',
        'cart.btn.onsite': 'Ordenar Ahora (Pagar en el lugar)',
        'cart.btn.onway': 'Continuar al Pago (Garantía)',
        'lube.catalog.title': 'Lubricantes',
        'lube.catalog.sub': 'Mostrador Digital',
        'lube.catalog.hero': 'Rendimiento Puro',
        'lube.catalog.desc': 'Descubra nuestra gama completa de aceites y lubricantes. Encuentre su producto y recójalo en la estación.',
        'lube.search': 'Buscar un aceite (ej. 5W30, Sintético...)',
        'lube.price_station': 'Precio en Estación',
        'lube.desc': 'Descripción',
        'lube.benefits': 'Beneficios',
        'lube.avail': 'Disponible en la Estación',
        'lube.avail.desc': 'Visite el mostrador de la estación para recoger este producto. Pago en el lugar únicamente.',
        'lube.close': 'Cerrar',
        'lube.details': 'Haz clic para ver detalles'
    },
    ar: {
        'cart.where': 'أين أنت؟',
        'cart.onsite': 'في المحطة (هنا)',
        'cart.onway': 'في الطريق (قادم)',
        'cart.where_exact': 'أين تريد استلام طلبك بالضبط؟',
        'cart.loc.table': 'طاولة (مقهى/مطعم)',
        'cart.loc.pump': 'مضخة / موقف سيارات',
        'cart.loc.pool': 'المسبح',
        'cart.loc.room': 'غرفة فندق',
        'cart.loc.placeholder': 'مثال: طاولة 12، مضخة 4، إلخ.',
        'cart.onsite_note': 'لا يتطلب الدفع عبر الإنترنت. ستدفع عند استلام طلبك.',
        'cart.eta.title': 'وقت الوصول المتوقع (ETA)',
        'cart.eta.custom': 'أدخل وقتاً محدداً',
        'cart.eta.hours': 'ساعات',
        'cart.eta.mins': 'دقائق',
        'cart.eta.apply': 'تطبيق',
        'cart.onway_note': 'بالنسبة لطلبات "في الطريق"، سيُطلب الدفع المسبق أو ضمان ببطاقة الائتمان في الخطوة التالية.',
        'cart.btn.onsite': 'اطلب الآن (الدفع في المكان)',
        'cart.btn.onway': 'المتابعة إلى الدفع (ضمان)',
        'lube.catalog.title': 'زيوت التشحيم',
        'lube.catalog.sub': 'متجر رقمي',
        'lube.catalog.hero': 'أداء نقي',
        'lube.catalog.desc': 'اكتشف مجموعتنا الكاملة من الزيوت ومواد التشحيم. ابحث عن منتجك واستلمه في المحطة.',
        'lube.search': 'ابحث عن زيت (مثال: 5W30، اصطناعي...)',
        'lube.price_station': 'السعر في المحطة',
        'lube.desc': 'الوصف',
        'lube.benefits': 'المزايا',
        'lube.avail': 'متوفر في المحطة',
        'lube.avail.desc': 'تفضل بزيارة متجر المحطة لاستلام هذا المنتج. الدفع في المكان فقط.',
        'lube.close': 'إغلاق',
        'lube.details': 'انقر لرؤية التفاصيل'
    }
};

for (const lang of ['fr', 'en', 'es', 'ar']) {
    const keysObj = newKeys[lang];
    const keysStr = Object.entries(keysObj).map(([k, v]) => `        '${k}': '${v.replace(/'/g, "\\'")}'`).join(',\n');
    
    // Find the end of the dictionary for this language
    // e.g. for fr:
    //         'restaurant.note.placeholder': '...'
    //     },
    //     en: {
    const langRegex = new RegExp(`(${lang}:\\s*{[\\s\\S]*?)(\\s*})`, 'm');
    const match = content.match(langRegex);
    if (match) {
        // match[1] is everything from "lang: {" to the last key
        // Before replacing, let's make sure we append a comma to the last key if it doesn't have one
        let inner = match[1];
        if (!inner.trim().endsWith(',')) {
            inner += ',';
        }
        inner += '\n' + keysStr;
        content = content.replace(langRegex, inner + match[2]);
    }
}

fs.writeFileSync(path, content, 'utf8');
console.log('Dictionaries updated.');
