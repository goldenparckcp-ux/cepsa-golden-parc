const fs = require('fs');

const dictPath = 'lib/i18n/dictionaries.ts';
let dictContent = fs.readFileSync(dictPath, 'utf8');

const frKeys = `
        // Home Page
        'home.hero.badge': 'STATION PREMIUM CEPSA',
        'home.hero.subtitle': 'Votre espace premium de détente et de ravitaillement.',
        'home.eta.title': 'Temps de trajet estimé',
        'home.eta.distance': 'Distance',
        'home.eta.button': 'Y Aller',
        
        'home.promo1.badge': 'Catalogue 100% Digital',
        'home.promo1.title': 'Comptoir Lubrifiants',
        'home.promo1.desc': 'Découvrez notre gamme complète d\\'huiles de performance.',
        'home.promo2.badge': 'Spécial Ramadan',
        'home.promo2.title': 'Menu Ftour',
        'home.promo2.desc': 'Le Ftour beldi complet à 20 DH.',
        
        'home.engage.1.title': 'Qualité Premium',
        'home.engage.1.desc': 'Des carburants et lubrifiants de pointe pour une performance optimale de votre moteur.',
        'home.engage.2.title': 'Service Express',
        'home.engage.2.desc': 'Un restaurant et un café pensés pour ceux qui sont sur la route. Rapide et délicieux.',
        'home.engage.3.title': 'Ouvert 24h/24',
        'home.engage.3.desc': 'Jour et nuit, notre équipe est là pour vous servir avec le sourire et le même niveau d\\'exigence.',
        
        'home.spaces.title': 'Nos Espaces',
        'home.spaces.subtitle': 'Sélectionnez un service pour commencer.',
        'home.service.boutique.title': 'Boutique',
        
        'home.info.title': 'Informations Pratiques',
        'home.info.loc.badge': 'LOCALISATION',
        'home.info.loc.address1': 'Route Nationale 15',
        'home.info.loc.address2': 'Outat El Haj, Maroc',
        'home.info.loc.maps': 'Ouvrir dans Google Maps',
        'home.info.contact.title': 'Assistance Station',
        'home.info.contact.desc': 'Disponible 24/7 pour toute question.',
        'home.info.time.title': 'Horaires',
        'home.info.time.station': 'Station & Carburant',
        'home.info.time.open': '24/7 Ouvert',
        'home.info.time.resto': 'Restaurant & Café',
        'home.info.time.lube': 'Lubrifiants & Boutique',
`;

const enKeys = `
        // Home Page
        'home.hero.badge': 'PREMIUM CEPSA STATION',
        'home.hero.subtitle': 'Your premium space for relaxation and refueling.',
        'home.eta.title': 'Estimated travel time',
        'home.eta.distance': 'Distance',
        'home.eta.button': 'Go There',
        
        'home.promo1.badge': '100% Digital Catalog',
        'home.promo1.title': 'Lubricants Counter',
        'home.promo1.desc': 'Discover our complete range of performance oils.',
        'home.promo2.badge': 'Ramadan Special',
        'home.promo2.title': 'Ftour Menu',
        'home.promo2.desc': 'The complete beldi Ftour at 20 DH.',
        
        'home.engage.1.title': 'Premium Quality',
        'home.engage.1.desc': 'Advanced fuels and lubricants for optimal engine performance.',
        'home.engage.2.title': 'Express Service',
        'home.engage.2.desc': 'A restaurant and cafe designed for those on the road. Fast and delicious.',
        'home.engage.3.title': 'Open 24/7',
        'home.engage.3.desc': 'Day and night, our team is here to serve you with a smile and the same level of excellence.',
        
        'home.spaces.title': 'Our Spaces',
        'home.spaces.subtitle': 'Select a service to start.',
        'home.service.boutique.title': 'Shop',
        
        'home.info.title': 'Practical Information',
        'home.info.loc.badge': 'LOCATION',
        'home.info.loc.address1': 'National Route 15',
        'home.info.loc.address2': 'Outat El Haj, Morocco',
        'home.info.loc.maps': 'Open in Google Maps',
        'home.info.contact.title': 'Station Assistance',
        'home.info.contact.desc': 'Available 24/7 for any questions.',
        'home.info.time.title': 'Opening Hours',
        'home.info.time.station': 'Station & Fuel',
        'home.info.time.open': '24/7 Open',
        'home.info.time.resto': 'Restaurant & Cafe',
        'home.info.time.lube': 'Lubricants & Shop',
`;

const arKeys = `
        // Home Page
        'home.hero.badge': 'محطة سيبسا الممتازة',
        'home.hero.subtitle': 'مساحتك الفاخرة للاسترخاء والتزود بالوقود.',
        'home.eta.title': 'وقت الرحلة المقدر',
        'home.eta.distance': 'المسافة',
        'home.eta.button': 'انطلق',
        
        'home.promo1.badge': 'كتالوج رقمي 100٪',
        'home.promo1.title': 'عداد زيوت التشحيم',
        'home.promo1.desc': 'اكتشف مجموعتنا الكاملة من زيوت الأداء.',
        'home.promo2.badge': 'عرض رمضان',
        'home.promo2.title': 'قائمة الفطور',
        'home.promo2.desc': 'الفطور البلدي الكامل بـ 20 درهم.',
        
        'home.engage.1.title': 'جودة ممتازة',
        'home.engage.1.desc': 'وقود وزيوت متطورة لأداء مثالي للمحرك.',
        'home.engage.2.title': 'خدمة سريعة',
        'home.engage.2.desc': 'مطعم ومقهى مصممان للمسافرين. سريع ولذيذ.',
        'home.engage.3.title': 'مفتوح 24/7',
        'home.engage.3.desc': 'ليلاً ونهاراً، فريقنا هنا لخدمتك بابتسامة وبنفس مستوى التميز.',
        
        'home.spaces.title': 'مساحاتنا',
        'home.spaces.subtitle': 'اختر خدمة للبدء.',
        'home.service.boutique.title': 'المتجر',
        
        'home.info.title': 'معلومات عملية',
        'home.info.loc.badge': 'الموقع',
        'home.info.loc.address1': 'الطريق الوطنية 15',
        'home.info.loc.address2': 'أوطاط الحاج، المغرب',
        'home.info.loc.maps': 'افتح في خرائط جوجل',
        'home.info.contact.title': 'مساعدة المحطة',
        'home.info.contact.desc': 'متاح 24/7 لأي استفسار.',
        'home.info.time.title': 'ساعات العمل',
        'home.info.time.station': 'المحطة والوقود',
        'home.info.time.open': 'مفتوح 24/7',
        'home.info.time.resto': 'المطعم والمقهى',
        'home.info.time.lube': 'زيوت التشحيم والمتجر',
`;

const esKeys = `
        // Home Page
        'home.hero.badge': 'ESTACIÓN PREMIUM CEPSA',
        'home.hero.subtitle': 'Tu espacio premium para relajarte y repostar.',
        'home.eta.title': 'Tiempo estimado de viaje',
        'home.eta.distance': 'Distancia',
        'home.eta.button': 'Ir Allí',
        
        'home.promo1.badge': 'Catálogo 100% Digital',
        'home.promo1.title': 'Mostrador de Lubricantes',
        'home.promo1.desc': 'Descubre nuestra gama completa de aceites de rendimiento.',
        'home.promo2.badge': 'Especial Ramadán',
        'home.promo2.title': 'Menú Iftar',
        'home.promo2.desc': 'El Iftar beldi completo a 20 DH.',
        
        'home.engage.1.title': 'Calidad Premium',
        'home.engage.1.desc': 'Combustibles y lubricantes avanzados para un rendimiento óptimo del motor.',
        'home.engage.2.title': 'Servicio Exprés',
        'home.engage.2.desc': 'Un restaurante y cafetería pensados para quienes están en la carretera. Rápido y delicioso.',
        'home.engage.3.title': 'Abierto 24/7',
        'home.engage.3.desc': 'Día y noche, nuestro equipo está aquí para servirte con una sonrisa y el mismo nivel de exigencia.',
        
        'home.spaces.title': 'Nuestros Espacios',
        'home.spaces.subtitle': 'Selecciona un servicio para comenzar.',
        'home.service.boutique.title': 'Tienda',
        
        'home.info.title': 'Información Práctica',
        'home.info.loc.badge': 'UBICACIÓN',
        'home.info.loc.address1': 'Ruta Nacional 15',
        'home.info.loc.address2': 'Outat El Haj, Marruecos',
        'home.info.loc.maps': 'Abrir en Google Maps',
        'home.info.contact.title': 'Asistencia en Estación',
        'home.info.contact.desc': 'Disponible 24/7 para cualquier pregunta.',
        'home.info.time.title': 'Horarios',
        'home.info.time.station': 'Estación y Combustible',
        'home.info.time.open': 'Abierto 24/7',
        'home.info.time.resto': 'Restaurante y Cafetería',
        'home.info.time.lube': 'Lubricantes y Tienda',
`;

// Insert directly before the closing bracket of each dictionary
dictContent = dictContent.replace(/(export const fr = {[\s\S]*?)(\s*};)/, \`$1\${frKeys}$2\`);
dictContent = dictContent.replace(/(export const en = {[\s\S]*?)(\s*};)/, \`$1\${enKeys}$2\`);
dictContent = dictContent.replace(/(export const ar = {[\s\S]*?)(\s*};)/, \`$1\${arKeys}$2\`);
dictContent = dictContent.replace(/(export const es = {[\s\S]*?)(\s*};)/, \`$1\${esKeys}$2\`);

fs.writeFileSync(dictPath, dictContent);

// Update page.tsx
const pagePath = 'app/page.tsx';
let pageContent = fs.readFileSync(pagePath, 'utf8');

const replacements = [
    ['STATION PREMIUM CEPSA', "{t('home.hero.badge')}"],
    ['Votre espace premium de détente et de ravitaillement.', "{t('home.hero.subtitle')}"],
    ['Temps de trajet estimé', "{t('home.eta.title')}"],
    ['Distance</p>', "{t('home.eta.distance')}</p>"],
    ['>Y Aller<', ">{t('home.eta.button')}<"],
    
    ['>Catalogue 100% Digital<', ">{t('home.promo1.badge')}<"],
    ['>Comptoir Lubrifiants<', ">{t('home.promo1.title')}<"],
    ["Découvrez notre gamme complète d'huiles de performance.", "{t('home.promo1.desc')}"],
    ['>Spécial Ramadan<', ">{t('home.promo2.badge')}<"],
    ['>Menu Ftour<', ">{t('home.promo2.title')}<"],
    ['Le Ftour beldi complet à 20 DH.', "{t('home.promo2.desc')}"],
    
    ['>Qualité Premium<', ">{t('home.engage.1.title')}<"],
    ['Des carburants et lubrifiants de pointe pour une performance optimale de votre moteur.', "{t('home.engage.1.desc')}"],
    ['>Service Express<', ">{t('home.engage.2.title')}<"],
    ['Un restaurant et un café pensés pour ceux qui sont sur la route. Rapide et délicieux.', "{t('home.engage.2.desc')}"],
    ['>Ouvert 24h/24<', ">{t('home.engage.3.title')}<"],
    ["Jour et nuit, notre équipe est là pour vous servir avec le sourire et le même niveau d'exigence.", "{t('home.engage.3.desc')}"],
    
    ['>Nos Espaces<', ">{t('home.spaces.title')}<"],
    ['Sélectionnez un service pour commencer.', "{t('home.spaces.subtitle')}"],
    ['title: "Boutique"', "title: t('home.service.boutique.title') || 'Boutique'"],
    
    ['>Informations Pratiques<', ">{t('home.info.title')}<"],
    ['> LOCALISATION', "> {t('home.info.loc.badge')}"],
    ['>Route Nationale 15<', ">{t('home.info.loc.address1')}<"],
    ['>Outat El Haj, Maroc<', ">{t('home.info.loc.address2')}<"],
    ['Ouvrir dans Google Maps', "{t('home.info.loc.maps')}"],
    ['>Assistance Station<', ">{t('home.info.contact.title')}<"],
    ['Disponible 24/7 pour toute question.', "{t('home.info.contact.desc')}"],
    ['>Horaires<', ">{t('home.info.time.title')}<"],
    ['>Station & Carburant<', ">{t('home.info.time.station')}<"],
    ['>24/7 Ouvert<', ">{t('home.info.time.open')}<"],
    ['>Restaurant & Café<', ">{t('home.info.time.resto')}<"],
    ['>Lubrifiants & Boutique<', ">{t('home.info.time.lube')}<"]
];

replacements.forEach(([search, replace]) => {
    pageContent = pageContent.replace(search, replace);
});

fs.writeFileSync(pagePath, pageContent);

console.log("Translations added successfully!");
