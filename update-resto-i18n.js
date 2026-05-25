const fs = require('fs');

const path = 'app/restaurant/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacements = [
    ["Où êtes-vous ?", "{t('cart.where')}"],
    ["Sur Place (Ici)", "{t('cart.onsite')}"],
    ["En Route (J'arrive)", "{t('cart.onway')}"],
    ["Où vous livrer exactement ?", "{t('cart.where_exact')}"],
    ["Table (Café/Resto)", "{t('cart.loc.table')}"],
    ["Pompe / Parking", "{t('cart.loc.pump')}"],
    ["Piscine", "{t('cart.loc.pool')}"],
    ["Chambre Hôtel", "{t('cart.loc.room')}"],
    ["Temps d'arrivée estimé (ETA)", "{t('cart.eta.title')}"],
    ["Saisir une heure précise", "{t('cart.eta.custom')}"],
    [">Heures<", ">{t('cart.eta.hours')}<"],
    [">Minutes<", ">{t('cart.eta.mins')}<"],
    ["Appliquer", "{t('cart.eta.apply')}"],
    [`Pour les commandes "En Route", un pré-paiement ou garantie par carte bancaire sera requis à l'étape suivante.`, "{t('cart.onway_note')}"],
    ["Aucun paiement en ligne requis. Vous paierez à la réception de votre commande.", "{t('cart.onsite_note')}"],
    ["Commander Maintenant (Payer sur place)", "{t('cart.btn.onsite')}"],
    ["Continuer vers le Paiement (Garantie)", "{t('cart.btn.onway')}"]
];

replacements.forEach(([search, replace]) => {
    content = content.replace(search, replace);
});

// Fix the placeholder
content = content.replace(
    /placeholder=\{\`Ex: \$\{onSiteLocation === 'table' \? 'Table 12' : onSiteLocation === 'pump' \? 'Pompe 4 ou Plaque XYZ' : onSiteLocation === 'pool' \? 'Transat N°5' : 'Chambre 105'\}\`\}/g,
    "placeholder={t('cart.loc.placeholder')}"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Restaurant page translated.');
