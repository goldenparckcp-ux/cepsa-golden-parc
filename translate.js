const fs = require('fs');
let content = fs.readFileSync('lib/types/menu.ts', 'utf8');

content = content.replace(/name: string;\s*description: string;/g, 'name: string;\n    name_ar?: string;\n    description: string;\n    description_ar?: string;');

const translations = [
  ["name: \"Pizza Personnalisée\",", "name: \"Pizza Personnalisée\",\n        name_ar: \"بيتزا مخصصة\","],
  ["description: \"Créez votre pizza parfaite avec la pâte et les garnitures de votre choix.\",", "description: \"Créez votre pizza parfaite avec la pâte et les garnitures de votre choix.\",\n        description_ar: \"اصنع البيتزا المثالية مع العجينة والإضافات التي تختارها.\","],
  
  ["name: \"Tacos Sur Mesure\",", "name: \"Tacos Sur Mesure\",\n        name_ar: \"طاكوس على المقاس\","],
  ["description: \"Votre Tacos avec frites et sauce fromagère maison.\",", "description: \"Votre Tacos avec frites et sauce fromagère maison.\",\n        description_ar: \"طاكوس مع بطاطس مقلية وصلصة الجبن المنزلية.\","],

  ["name: \"Burger Maison\",", "name: \"Burger Maison\",\n        name_ar: \"برغر منزلي\","],
  ["description: \"Steak haché de boeuf, salade, tomate, oignons, sauce burger.\",", "description: \"Steak haché de boeuf, salade, tomate, oignons, sauce burger.\",\n        description_ar: \"شريحة لحم بقري مفروم، سلطة، طماطم، بصل، وصلصة برغر.\","],

  ["name: \"Panini Pressé\",", "name: \"Panini Pressé\",\n        name_ar: \"بانيني\","],
  ["description: \"Pain ciabatta, fromage fondant, garniture au choix.\",", "description: \"Pain ciabatta, fromage fondant, garniture au choix.\",\n        description_ar: \"خبز الشيباتا، جبن ذائب، حشوة من اختيارك.\","],

  ["name: \"Sandwich Classique\",", "name: \"Sandwich Classique\",\n        name_ar: \"ساندويتش كلاسيكي\","],
  ["description: \"Baguette croustillante, frites, salade, garniture au choix.\",", "description: \"Baguette croustillante, frites, salade, garniture au choix.\",\n        description_ar: \"باكيط مقرمش، بطاطس مقلية، سلطة، حشوة من اختيارك.\","],

  ["name: \"Sandwich Pain Maison\",", "name: \"Sandwich Pain Maison\",\n        name_ar: \"ساندويتش بخبز الدار\","],
  ["description: \"Notre spécialité pain maison extra moelleux.\",", "description: \"Notre spécialité pain maison extra moelleux.\",\n        description_ar: \"تخصصنا بخبز منزلي ناعم جداً.\","],

  ["name: \"Pasticcio & Lasagnes\",", "name: \"Pasticcio & Lasagnes\",\n        name_ar: \"باستيشيو و لازانيا\","],
  ["description: \"Plats au four gratinés.\",", "description: \"Plats au four gratinés.\",\n        description_ar: \"أطباق مخبوزة ومحمرة في الفرن.\","],

  ["name: \"Shawarma & Cheese Naan\",", "name: \"Shawarma & Cheese Naan\",\n        name_ar: \"شاورما و نان بالجبن\","],
  ["description: \"Spécialités orientales, pain libanais ou indien au fromage.\",", "description: \"Spécialités orientales, pain libanais ou indien au fromage.\",\n        description_ar: \"تخصصات شرقية، خبز لبناني أو هندي بالجبن.\","],

  ["name: \"Tajine Marocain\",", "name: \"Tajine Marocain\",\n        name_ar: \"طاجين مغربي\","],
  ["description: \"Cuit lentement sur charbon (Fekhar).\",", "description: \"Cuit lentement sur charbon (Fekhar).\",\n        description_ar: \"مطهو ببطء على الفحم (طاجين الفخار).\","],

  ["name: \"Poulet Rôti (Djaj Mhamer)\",", "name: \"Poulet Rôti (Djaj Mhamer)\",\n        name_ar: \"دجاج محمر\","],
  ["description: \"Poulet rôti à la marocaine avec frites et olives.\",", "description: \"Poulet rôti à la marocaine avec frites et olives.\",\n        description_ar: \"دجاج محمر على الطريقة المغربية مع البطاطس والزيتون.\","],

  ["name: \"Couscous (Vendredi)\",", "name: \"Couscous (Vendredi)\",\n        name_ar: \"كسكس (الجمعة)\","],
  ["description: \"Plat traditionnel marocain, servi uniquement le vendredi.\",", "description: \"Plat traditionnel marocain, servi uniquement le vendredi.\",\n        description_ar: \"طبق مغربي تقليدي، يقدم يوم الجمعة فقط.\","],

  ["name: \"Pâtes\",", "name: \"Pâtes\",\n        name_ar: \"معكرونة (پاستا)\","],
  ["description: \"Spaghetti ou Penne servis avec votre sauce préférée.\",", "description: \"Spaghetti ou Penne servis avec votre sauce préférée.\",\n        description_ar: \"سباغيتي أو بيني تقدم مع الصلصة المفضلة لديك.\","],

  ["name: \"Omelette\",", "name: \"Omelette\",\n        name_ar: \"أومليط\","],
  ["description: \"Œufs de ferme préparés à votre goût.\",", "description: \"Œufs de ferme préparés à votre goût.\",\n        description_ar: \"بيض مزرعة محضر حسب ذوقك.\","],

  ["name: \"Ftour Complet\",", "name: \"Ftour Complet\",\n        name_ar: \"فطور كامل\","],
  ["description: \"Petit déjeuner complet traditionnel.\",", "description: \"Petit déjeuner complet traditionnel.\",\n        description_ar: \"فطور تقليدي كامل.\","],

  ["name: \"Crêpes & Galettes Chaudes\",", "name: \"Crêpes & Galettes Chaudes\",\n        name_ar: \"فطائر ومسمن\","],
  ["description: \"Assortiment de Baghrir, Msamen, Harcha.\",", "description: \"Assortiment de Baghrir, Msamen, Harcha.\",\n        description_ar: \"تشكيلة من البغرير، المسمن، والحرشة.\","],

  ["name: \"Salade Fraîche\",", "name: \"Salade Fraîche\",\n        name_ar: \"سلطة طازجة\","],
  ["description: \"Légumes frais de saison.\",", "description: \"Légumes frais de saison.\",\n        description_ar: \"خضروات موسمية طازجة.\","],

  ["name: \"Jus Frais\",", "name: \"Jus Frais\",\n        name_ar: \"عصير طازج\","],
  ["description: \"Pressé minute, 100% fruits.\",", "description: \"Pressé minute, 100% fruits.\",\n        description_ar: \"معصور طازج، 100٪ فواكه.\","],

  ["name: \"Cafétéria\",", "name: \"Cafétéria\",\n        name_ar: \"مقهى\","],
  ["description: \"Boissons chaudes premium.\",", "description: \"Boissons chaudes premium.\",\n        description_ar: \"مشروبات ساخنة ممتازة.\","],

  ["name: \"Soda & Eau\",", "name: \"Soda & Eau\",\n        name_ar: \"مشروبات غازية وماء\","],
  ["description: \"Boissons fraîches.\",", "description: \"Boissons fraîches.\",\n        description_ar: \"مشروبات باردة.\","],

  ["name: \"Salade de fruit\",", "name: \"Salade de fruit\",\n        name_ar: \"سلطة فواكه\","],
  ["description: \"Cocktail de fruits de saison fraîchement coupés.\",", "description: \"Cocktail de fruits de saison fraîchement coupés.\",\n        description_ar: \"كوكتيل فواكه موسمية مقطعة طازجة.\","],

  ["name: \"Flan Amlou\",", "name: \"Flan Amlou\",\n        name_ar: \"فلان بأملو\","],
  ["description: \"Flan onctueux parfumé à la pâte d'Amlou.\",", "description: \"Flan onctueux parfumé à la pâte d'Amlou.\",\n        description_ar: \"فلان ناعم بنكهة عجينة أملو.\","],

  ["name: \"Za3za3\",", "name: \"Za3za3\",\n        name_ar: \"زعزع\","],
  ["description: \"Cocktail avocat, fruits, crème et fruits secs.\",", "description: \"Cocktail avocat, fruits, crème et fruits secs.\",\n        description_ar: \"كوكتيل أفوكادو، فواكه، كريمة وفواكه جافة.\","]
];

translations.forEach(([original, translated]) => {
  content = content.replace(original, translated);
});

fs.writeFileSync('lib/types/menu.ts', content, 'utf8');
console.log('Translations applied successfully');
