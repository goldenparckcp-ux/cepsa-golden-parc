const fs = require('fs');
const pagePath = 'app/page.tsx';
let pageContent = fs.readFileSync(pagePath, 'utf8');

const replacements = [
    ['STATION PREMIUM CEPSA', "{t('home.hero.badge')}"],
    ['Votre espace premium de détente et de ravitaillement.', "{t('home.hero.subtitle')}"],
    ['>Temps de trajet estimé<', ">{t('home.eta.title')}<"],
    ['>Distance<', ">{t('home.eta.distance')}<"],
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
    ['>Ouvrir dans Google Maps ', ">{t('home.info.loc.maps')} "],
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
console.log("Translations added to page.tsx successfully!");
