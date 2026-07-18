"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, Home, HelpCircle, Phone, MapPin, Clock, Bed, Utensils, Waves, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/lib/state/LanguageContext";
import { supabase } from "@/lib/supabase";

const content = {
  fr: {
    backBtn: "Retour à l'accueil",
    helpCentre: "Centre d'aide",
    title1: "Foire Aux",
    title2: "Questions",
    desc: "Trouvez des réponses instantanées à toutes vos questions concernant notre hôtel, restaurant, piscine, tarifs et services de la station.",
    placeholder: "Rechercher une question (ex: horaires, réservation, piscine...)",
    cats: {
      all: "Toutes",
      general: "Station & Infos",
      hotel: "Hôtel L'Escale",
      restaurant: "Restaurant",
      pool: "Piscine",
      lube: "Entretien Auto"
    },
    faqs: [
      {
        q: "Où se situe la station Golden Park exactement ?",
        a: "Golden Park Cepsa est idéalement située sur la Route Nationale 15 (RN15) à Outat El Haj. C'est l'escale parfaite et reposante pour faire le plein, manger ou dormir sur le trajet entre le Nord et le Sud du Maroc.",
        category: "general"
      },
      {
        q: "Quels sont les horaires d'ouverture de la station-service ?",
        a: "La station-service Cepsa (distribution de carburant) et son shop/boutique de dépannage sont ouverts 24h/24 et 7j/7 sans aucune interruption.",
        category: "general"
      },
      {
        q: "Comment contacter l'assistance en cas de besoin ?",
        a: "Vous pouvez joindre notre réception et assistance client 24h/24 au numéro de téléphone direct : 06 61 69 01 79.",
        category: "general"
      },
      {
        q: "Quels types de chambres proposez-vous à l'Hôtel L'Escale ?",
        a: "Nous proposons trois types d'hébergement modernes : la Chambre Standard (lit double, douche italienne), la Suite Deluxe (espace salon privé, finitions premium) et la Suite Familiale (lits jumeaux, kitchenette, espace jeux pour enfants). Toutes nos chambres disposent de la climatisation silencieuse.",
        category: "hotel"
      },
      {
        q: "Qu'est-ce que la formule 'Sieste' (Day Use) ?",
        a: "La formule 'Sieste' permet de réserver une chambre en journée pour une courte durée (jusqu'à 6 heures) à un tarif réduit. C'est la solution idéale pour les voyageurs fatigués qui souhaitent se doucher et dormir quelques heures avant de reprendre la route en toute sécurité.",
        category: "hotel"
      },
      {
        q: "Les équipements comme le Wi-Fi ou la TV sont-ils inclus ?",
        a: "Oui, toutes les réservations incluent un accès gratuit au Wi-Fi haut débit par fibre optique, une télévision HD avec chaînes satellites, une douche italienne avec eau chaude, du linge de lit de qualité et un mini-bar.",
        category: "hotel"
      },
      {
        q: "Comment annuler ou modifier ma réservation d'hôtel ?",
        a: "Vous pouvez annuler ou modifier vos nuitées et siestes directement sur votre profil en ligne (onglet 'Mon Profil') jusqu'à 24 heures avant l'heure d'arrivée prévue.",
        category: "hotel"
      },
      {
        q: "Quels sont les horaires d'ouverture du restaurant ?",
        a: "Le Restaurant Golden Park et son café premium sont ouverts tous les jours de 06:00 du matin à minuit (00:00).",
        category: "restaurant"
      },
      {
        q: "Quel type de cuisine proposez-vous ?",
        a: "Notre chef propose des grillades traditionnelles cuites au feu de bois, des tajines marocains authentiques, des pizzas savoureuses, des viennoiseries et pains frais faits sur place dans notre espace boulangerie, ainsi qu'une sélection de cafés de spécialité.",
        category: "restaurant"
      },
      {
        q: "Puis-je commander à manger en indiquant mon emplacement exact ?",
        a: "Oui ! C'est l'un de nos services exclusifs. Depuis l'onglet 'Restaurant', vous pouvez passer commande et spécifier votre emplacement sur le complexe : votre numéro de table au café, votre pompe à essence, la piscine ou directement votre numéro de chambre d'hôtel.",
        category: "restaurant"
      },
      {
        q: "Quels sont les moyens de paiement acceptés pour la nourriture ?",
        a: "Pour le restaurant, aucun pré-paiement en ligne n'est obligatoire si vous êtes sur place. Vous réglez directement le serveur lors de la livraison, en espèces ou par carte bancaire (TPE mobile). Si vous commandez 'En Route', un paiement de garantie par carte est requis.",
        category: "restaurant"
      },
      {
        q: "Quels sont les horaires d'ouverture et tarifs de la piscine ?",
        a: "La piscine extérieure est accessible pendant la saison estivale de 09:00 à 19:00. Les tarifs d'entrée journaliers sont de 50 DH pour les adultes et 30 DH pour les enfants.",
        category: "pool"
      },
      {
        q: "Comment sont organisées les journées à la piscine (Mixte, Familles, Femmes) ?",
        a: "Pour le confort et le respect de l'intimité de chacun, nous avons mis en place des journées thématiques : le Lundi est exclusivement réservé aux familles ; le Jeudi est exclusivement réservé aux femmes ; tous les autres jours (mardi, mercredi, vendredi, samedi, dimanche) sont ouverts en accès mixte.",
        category: "pool"
      },
      {
        q: "Les chaises longues et parasols sont-ils payants ?",
        a: "Non, les chaises longues, transats et parasols installés autour du bassin sont mis gratuitement à la disposition de tous nos clients munis d'un ticket de piscine valide (dans la limite des places disponibles).",
        category: "pool"
      },
      {
        q: "Quels sont les horaires du comptoir d'entretien et de vidange ?",
        a: "Notre espace d'entretien auto et de vente de lubrifiants Cepsa est ouvert tous les jours de 08:00 à 20:00.",
        category: "lube"
      },
      {
        q: "Puis-je faire ma vidange sur place avec des huiles officielles ?",
        a: "Tout à fait. Nous disposons d'un comptoir officiel distribuant la gamme complète de lubrifiants CEPSA de haute qualité. Nos techniciens qualifiés peuvent effectuer votre vidange express et les contrôles associés directement en station.",
        category: "lube"
      },
      {
        q: "Est-ce que vous proposez encore le service de lavage de voiture ?",
        a: "Non. Le service de lavage auto classique a été définitivement arrêté sur notre complexe afin de recentrer nos équipes et nos installations sur les services d'entretien mécanique rapide, la vidange et la vente de lubrifiants officiels Cepsa.",
        category: "lube"
      }
    ]
  },
  ar: {
    backBtn: "العودة للرئيسية",
    helpCentre: "مركز المساعدة",
    title1: "الأسئلة",
    title2: "الشائعة",
    desc: "اعثر على إجابات فورية لجميع أسئلتك المتعلقة بالفندق، المطعم، المسبح، الأسعار وخدمات المحطة.",
    placeholder: "ابحث عن سؤال (مثال: أوقات العمل، حجز، مسبح...)",
    cats: {
      all: "الكل",
      general: "المحطة ومعلومات",
      hotel: "فندق L'Escale",
      restaurant: "المطعم",
      pool: "المسبح",
      lube: "صيانة السيارات"
    },
    faqs: [
      {
        q: "أين تقع محطة غولدن بارك بالضبط؟",
        a: "تقع محطة غولدن بارك Cepsa بشكل مثالي على الطريق الوطنية رقم 15 (RN15) في أوطاط الحاج. إنها المحطة المثالية والمريحة للتزود بالوقود، تناول الطعام أو النوم في طريقك بين شمال وجنوب المغرب.",
        category: "general"
      },
      {
        q: "ما هي أوقات عمل محطة الوقود؟",
        a: "محطة الوقود Cepsa (توزيع الوقود) ومتجرها مفتوحان على مدار 24 ساعة في اليوم و7 أيام في الأسبوع دون أي انقطاع.",
        category: "general"
      },
      {
        q: "كيف يمكنني الاتصال بالدعم عند الحاجة؟",
        a: "يمكنك الاتصال بمكتب الاستقبال وخدمة العملاء لدينا على مدار 24 ساعة على رقم الهاتف المباشر: 06 61 69 01 79.",
        category: "general"
      },
      {
        q: "ما هي أنواع الغرف المتوفرة في فندق L'Escale؟",
        a: "نقدم ثلاثة أنواع من الإقامة الحديثة: الغرفة القياسية (سرير مزدوج، دش إيطالي)، جناح ديلوكس (منطقة صالون خاص، تشطيبات فاخرة)، والجناح العائلي (سريران منفصلان، مطبخ صغير، منطقة ألعاب للأطفال). جميع غرفنا مجهزة بتكييف هواء صامت.",
        category: "hotel"
      },
      {
        q: "ما هي صيغة 'قيلولة' (Day Use)؟",
        a: "تتيح صيغة 'القيلولة' حجز غرفة خلال النهار لفترة قصيرة (تصل إلى 6 ساعات) بسعر مخفض. إنها الحل المثالي للمسافرين المتعبين الذين يرغبون في الاستحمام والنوم بضع ساعات قبل استئناف الطريق بكل أمان.",
        category: "hotel"
      },
      {
        q: "هل التجهيزات مثل الواي فاي أو التلفزيون مشمولة؟",
        a: "نعم، تشمل جميع الحجوزات وصولاً مجانيًا إلى شبكة الواي فاي عالية السرعة عبر الألياف البصرية، وتلفزيون HD مع قنوات فضائية، ودش إيطالي بماء ساخن، وملاءات سرير عالية الجودة، وثلاجة صغيرة.",
        category: "hotel"
      },
      {
        q: "كيف يمكنني إلغاء أو تعديل حجزي في الفندق؟",
        a: "يمكنك إلغاء أو تعديل حجوزات الغرف والقيلولة مباشرة من ملفك الشخصي عبر الإنترنت (علامة التبويب 'ملفي الشخصي') حتى 24 ساعة قبل موعد الوصول المحدد.",
        category: "hotel"
      },
      {
        q: "ما هي أوقات عمل المطعم؟",
        a: "يفتح مطعم غولدن بارك ومقهاه الفاخر يوميًا من الساعة 06:00 صباحًا حتى منتصف الليل (00:00).",
        category: "restaurant"
      },
      {
        q: "ما نوع الأطباق التي تقدمونها؟",
        a: "يقدم رئيس الطهاة لدينا مشويات تقليدية مطبوخة على الفحم، وطواجن مغربية أصيلة، وبيتزا لذيذة، وحلويات وخبز طازج يتم إعداده في عين المكان بمخبزنا، بالإضافة إلى تشكيلة من القهوة المختصة.",
        category: "restaurant"
      },
      {
        q: "هل يمكنني طلب الطعام وتحديد موقعي بدقة؟",
        a: "نعم! هذه إحدى خدماتنا الحصرية. من علامة التبويب 'المطعم'، يمكنك تقديم طلب وتحديد موقعك في المجمع: رقم طاولتك بالمقهى، مضخة الوقود، المسبح أو رقم غرفتك بالفندق مباشرة.",
        category: "restaurant"
      },
      {
        q: "ما هي طرق الدفع المقبولة للطعام؟",
        a: "بالنسبة للمطعم، لا يلزم الدفع المسبق عبر الإنترنت إذا كنت في عين المكان. يمكنك الدفع للنادل مباشرة عند الاستلام، نقدًا أو بالبطاقة البنكية (جهاز الدفع المحمول). إذا طلبت 'في الطريق'، فإن الدفع بالبطاقة كضمان يكون مطلوبًا.",
        category: "restaurant"
      },
      {
        q: "ما هي أوقات عمل وأسعار المسبح؟",
        a: "المسبح الخارجي مفتوح خلال الموسم الصيفي من الساعة 09:00 صباحًا حتى 19:00 مساءً. أسعار الدخول اليومية هي 50 درهمًا للكبار و30 درهمًا للأطفال.",
        category: "pool"
      },
      {
        q: "كيف يتم تنظيم الأيام في المسبح (مختلط، عائلات، نساء)؟",
        a: "من أجل راحة واحترام خصوصية الجميع، خصصنا أيامًا موضوعية: الاثنين مخصص حصريًا للعائلات؛ الخميس مخصص حصريًا للنساء؛ وجميع الأيام الأخرى (الثلاثاء، الأربعاء، الجمعة، السبت، الأحد) مفتوحة للجميع (مختلط).",
        category: "pool"
      },
      {
        q: "هل الكراسي الممتدة والمظلات مدفوعة الثمن؟",
        a: "لا، الكراسي الممتدة والمظلات حول المسبح متوفرة مجانًا لجميع عملائنا الذين يحملون تذكرة مسبح صالحة (في حدود الأماكن المتاحة).",
        category: "pool"
      },
      {
        q: "ما هي أوقات عمل قسم الصيانة وتغيير الزيت؟",
        a: "يفتح قسم صيانة السيارات وبيع زيوت Cepsa يوميًا من الساعة 08:00 صباحًا حتى 20:00 مساءً.",
        category: "lube"
      },
      {
        q: "هل يمكنني تغيير زيت السيارة في عين المكان بزيوت رسمية؟",
        a: "بالتأكيد. لدينا مركز رسمي يوزع المجموعة الكاملة من زيوت التشحيم CEPSA عالية الجودة. يمكن لفنيينا المؤهلين إجراء تغيير الزيت السريع والفحوصات المصاحبة مباشرة في المحطة.",
        category: "lube"
      },
      {
        q: "هل ما زلتم تقدمون خدمة غسيل السيارات؟",
        a: "لا. تم إيقاف خدمة غسيل السيارات الكلاسيكية نهائيًا في مجمعنا لتركيز فرقنا ومنشآتنا على خدمات الصيانة الميكانيكية السريعة وتغيير الزيت وبيع زيوت Cepsa الرسمية.",
        category: "lube"
      }
    ]
  },
  en: {
    backBtn: "Back to Home",
    helpCentre: "Help Centre",
    title1: "Frequently Asked",
    title2: "Questions",
    desc: "Find instant answers to all your questions regarding our hotel, restaurant, pool, prices, and services of the station.",
    placeholder: "Search for a question (ex: hours, booking, pool...)",
    cats: {
      all: "All",
      general: "Station & Info",
      hotel: "L'Escale Hotel",
      restaurant: "Restaurant",
      pool: "Pool",
      lube: "Auto Care"
    },
    faqs: [
      {
        q: "Where is the Golden Park station located exactly?",
        a: "Golden Park Cepsa is ideally located on National Route 15 (RN15) in Outat El Haj. It is the perfect and relaxing stopover to refuel, eat, or sleep on the journey between the North and South of Morocco.",
        category: "general"
      },
      {
        q: "What are the opening hours of the service station?",
        a: "The Cepsa service station (fuel distribution) and its shop/convenience store are open 24/7 without interruption.",
        category: "general"
      },
      {
        q: "How to contact assistance in case of need?",
        a: "You can reach our reception and customer assistance 24/7 at the direct phone number: 06 61 69 01 79.",
        category: "general"
      },
      {
        q: "What types of rooms do you offer at L'Escale Hotel?",
        a: "We offer three types of modern accommodation: Standard Room (double bed, Italian shower), Deluxe Suite (private lounge area, premium finishes), and Family Suite (twin beds, kitchenette, play area for children). All our rooms feature silent air conditioning.",
        category: "hotel"
      },
      {
        q: "What is the 'Siesta' (Day Use) formula?",
        a: "The 'Siesta' formula allows booking a room during the day for a short duration (up to 6 hours) at a reduced rate. It is the ideal solution for tired travelers who want to shower and sleep a few hours before safely hitting the road again.",
        category: "hotel"
      },
      {
        q: "Are amenities like Wi-Fi or TV included?",
        a: "Yes, all bookings include free high-speed fiber-optic Wi-Fi, HD TV with satellite channels, Italian shower with hot water, quality bedding, and a mini-bar.",
        category: "hotel"
      },
      {
        q: "How to cancel or modify my hotel reservation?",
        a: "You can cancel or modify your nights and siestas directly on your online profile (tab 'My Profile') up to 24 hours before the scheduled arrival time.",
        category: "hotel"
      },
      {
        q: "What are the opening hours of the restaurant?",
        a: "Golden Park Restaurant and its premium cafe are open daily from 06:00 AM to midnight (00:00).",
        category: "restaurant"
      },
      {
        q: "What type of cuisine do you offer?",
        a: "Our chef offers traditional grills cooked over a wood fire, authentic Moroccan tajines, savory pizzas, fresh pastries and breads made on site in our bakery area, and a selection of specialty coffees.",
        category: "restaurant"
      },
      {
        q: "Can I order food indicating my exact location?",
        a: "Yes! This is one of our exclusive services. From the 'Restaurant' tab, you can place an order and specify your location on the complex: your table number at the cafe, your gas pump, the pool, or directly your hotel room number.",
        category: "restaurant"
      },
      {
        q: "What payment methods are accepted for food?",
        a: "For the restaurant, no online pre-payment is mandatory if you are on site. You pay the server directly upon delivery, in cash or by credit card (mobile POS). If you order 'On the Way', a guarantee card payment is required.",
        category: "restaurant"
      },
      {
        q: "What are the opening hours and rates for the pool?",
        a: "The outdoor pool is accessible during the summer season from 09:00 AM to 07:00 PM. Daily entry rates are 50 MAD for adults and 30 MAD for children.",
        category: "pool"
      },
      {
        q: "How are pool days organized (Mixed, Families, Women)?",
        a: "For comfort and respect for everyone's privacy, we have set up themed days: Monday is exclusively reserved for families; Thursday is exclusively reserved for women; all other days (Tuesday, Wednesday, Friday, Saturday, Sunday) are open to mixed access.",
        category: "pool"
      },
      {
        q: "Are sun loungers and umbrellas charged?",
        a: "No, sun loungers, deckchairs, and umbrellas installed around the pool are available free of charge to all our customers with a valid pool ticket (subject to availability).",
        category: "pool"
      },
      {
        q: "What are the hours of the service and oil change counter?",
        a: "Our auto care and Cepsa lubricants sales space is open daily from 08:00 AM to 08:00 PM.",
        category: "lube"
      },
      {
        q: "Can I do my oil change on site with official oils?",
        a: "Absolutely. We have an official counter distributing the full range of high-quality CEPSA lubricants. Our qualified technicians can perform your express oil change and associated checks directly at the station.",
        category: "lube"
      },
      {
        q: "Do you still offer car wash service?",
        a: "No. The classic car wash service has been permanently stopped on our complex to refocus our teams and facilities on rapid mechanical maintenance, oil changes, and the sale of official Cepsa lubricants.",
        category: "lube"
      }
    ]
  },
  es: {
    backBtn: "Volver al Inicio",
    helpCentre: "Centro de ayuda",
    title1: "Preguntas",
    title2: "Frecuentes",
    desc: "Encuentre respuestas instantáneas a todas sus preguntas sobre nuestro hotel, restaurante, piscina, tarifas y servicios de la estación.",
    placeholder: "Buscar una pregunta (ej: horarios, reserva, piscina...)",
    cats: {
      all: "Todas",
      general: "Estación e Info",
      hotel: "Hotel L'Escale",
      restaurant: "Restaurante",
      pool: "Piscina",
      lube: "Cuidado Auto"
    },
    faqs: [
      {
        q: "¿Dónde se encuentra exactamente la estación Golden Park?",
        a: "Golden Park Cepsa está convenientemente ubicada en la Ruta Nacional 15 (RN15) en Outat El Haj. Es la parada perfecta y relajante para repostar, comer o dormir en el trayecto entre el Norte y el Sur de Marruecos.",
        category: "general"
      },
      {
        q: "¿Cuáles son los horarios de apertura de la gasolinera?",
        a: "La gasolinera Cepsa (distribución de combustible) y su tienda de conveniencia están abiertas las 24 horas del día, los 7 días de la semana sin interrupción.",
        category: "general"
      },
      {
        q: "¿Cómo contactar con asistencia en caso de necesidad?",
        a: "Puede comunicarse con nuestra recepción y asistencia al cliente las 24 horas al número de teléfono directo: 06 61 69 01 79.",
        category: "general"
      },
      {
        q: "¿Qué tipos de habitaciones ofrecen en el Hotel L'Escale?",
        a: "Ofrecemos tres tipos de alojamiento moderno: Habitación Estándar (cama doble, ducha italiana), Suite Deluxe (zona de salón privada, acabados premium) y Suite Familiar (dos camas individuales, cocina americana, zona de juegos para niños). Todas nuestras habitaciones cuentan con aire acondicionado silencioso.",
        category: "hotel"
      },
      {
        q: "¿Qué es la fórmula 'Siesta' (Day Use)?",
        a: "La fórmula 'Siesta' permite reservar una habitación durante el día por un corto período (hasta 6 horas) a una tarifa reducida. Es la solución ideal para viajeros cansados que desean ducharse y dormir unas horas antes de volver a la carretera con total seguridad.",
        category: "hotel"
      },
      {
        q: "¿Están incluidos servicios como Wi-Fi o TV?",
        a: "Sí, todas las reservas incluyen acceso gratuito a Wi-Fi de alta velocidad por fibra óptica, TV HD con canales satelitales, ducha italiana con agua caliente, ropa de cama de calidad y un minibar.",
        category: "hotel"
      },
      {
        q: "¿Cómo cancelar o modificar mi reserva de hotel?",
        a: "Puede cancelar o modificar sus noches y siestas directamente en su perfil en línea (pestaña 'Mi Perfil') hasta 24 horas antes de la hora de llegada programada.",
        category: "hotel"
      },
      {
        q: "¿Cuáles son los horarios de apertura del restaurante?",
        a: "Golden Park Restaurant y su cafetería premium están abiertos todos los días de 06:00 AM a medianoche (00:00).",
        category: "restaurant"
      },
      {
        q: "¿Qué tipo de cocina ofrecen?",
        a: "Nuestro chef ofrece parrilladas tradicionales cocinadas a la leña, auténticos tajines marroquíes, sabrosas pizzas, pastelería fresca y panes elaborados en el lugar en nuestra zona de panadería, así como una selección de cafés de especialidad.",
        category: "restaurant"
      },
      {
        q: "¿Puedo pedir comida indicando mi ubicación exacta?",
        a: "¡Sí! Este es uno de nuestros servicios exclusivos. Desde la pestaña 'Restaurante', puede realizar un pedido y especificar su ubicación en el complejo: su número de mesa en la cafetería, su bomba de gasolina, la piscina o directamente su número de habitación de hotel.",
        category: "restaurant"
      },
      {
        q: "¿Qué métodos de pago se aceptan para la comida?",
        a: "Para el restaurante, no es obligatorio el pago previo en línea si se encuentra en el lugar. Paga al camarero directamente al recibir el pedido, en efectivo o con tarjeta de crédito (TPV móvil). Si realiza un pedido 'En camino', se requiere un pago de garantía con tarjeta.",
        category: "restaurant"
      },
      {
        q: "¿Cuáles son los horarios de apertura y tarifas de la piscina?",
        a: "La piscina al aire libre es accesible durante la temporada de verano de 09:00 AM a 07:00 PM. Las tarifas de entrada diaria son de 50 DH para adultos y 30 DH para niños.",
        category: "pool"
      },
      {
        q: "¿Cómo se organizan los días de piscina (Mixto, Familias, Mujeres)?",
        a: "Para la comodidad y el respeto a la privacidad de todos, hemos establecido días temáticos: el lunes está reservado exclusivamente para familias; el jueves está reservado exclusivamente para mujeres; todos los demás días (martes, miércoles, viernes, sábado, domingo) están abiertos para acceso mixto.",
        category: "pool"
      },
      {
        q: "¿Se cobran las tumbonas y sombrillas?",
        a: "No, las tumbonas, hamacas y sombrillas instaladas alrededor de la piscina están disponibles de forma gratuita para todos nuestros clientes con una entrada válida (sujeto a disponibilidad).",
        category: "pool"
      },
      {
        q: "¿Cuáles son los horarios del mostrador de mantenimiento y cambio de aceite?",
        a: "Nuestro espacio de cuidado de automóviles y venta de lubricantes Cepsa está abierto todos los días de 08:00 AM a 08:00 PM.",
        category: "lube"
      },
      {
        q: "¿Puedo realizar mi cambio de aceite en el lugar con aceites oficiales?",
        a: "Por supuesto. Contamos con un mostrador oficial que distribuye la gama completa de lubricantes CEPSA de alta calidad. Nuestros técnicos calificados pueden realizar su cambio de aceite express y los controles asociados directamente en la estación.",
        category: "lube"
      },
      {
        q: "¿Ofrecen todavía el servicio de lavado de autos?",
        a: "No. El servicio clásico de lavado de autos se ha detenido permanentemente en nuestro complejo para reenfocar nuestros equipos e instalaciones en el mantenimiento mecánico rápido, cambios de aceite y la venta de lubricantes Cepsa oficiales.",
        category: "lube"
      }
    ]
  }
};

export default function FAQPage() {
    const router = useRouter();
    const { language } = useTranslation();
    const [contactSettings, setContactSettings] = useState<any>(null);

    const activeLang = (['fr', 'ar', 'en', 'es'].includes(language) ? language : 'fr') as keyof typeof content;
    const tLocal = content[activeLang];

    React.useEffect(() => {
        const fetchContact = async () => {
            const { data } = await supabase.from('home_promos').select('*').eq('sort_order', -999).single();
            if (data) setContactSettings(data);
        };
        fetchContact();
    }, []);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // Filters FAQ based on category and search query
    const filteredFAQs = useMemo(() => {
        return tLocal.faqs.filter((item) => {
            const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
            const matchesSearch =
                item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.a.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory, tLocal.faqs]);

    const categories = [
        { id: "all", label: tLocal.cats.all, icon: HelpCircle },
        { id: "general", label: tLocal.cats.general, icon: MapPin },
        { id: "hotel", label: tLocal.cats.hotel, icon: Bed },
        { id: "restaurant", label: tLocal.cats.restaurant, icon: Utensils },
        { id: "pool", label: tLocal.cats.pool, icon: Waves },
        { id: "lube", label: tLocal.cats.lube, icon: Wrench }
    ];

    return (
        <main className="min-h-screen bg-[#0B0F19] text-white pt-24 md:pt-32 pb-40 relative overflow-hidden font-sans">
            {/* Background Light Effects */}
            <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                {/* Back button */}
                <button
                    onClick={() => router.push("/")}
                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8 group"
                >
                    <Home className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    {tLocal.backBtn}
                </button>

                {/* Header */}
                <div className="mb-12 text-center md:text-left">
                    <div className="inline-flex bg-red-600/10 border border-red-500/20 text-red-500 text-xs font-black px-4 py-2 rounded-xl uppercase tracking-wider mb-4">
                        {tLocal.helpCentre}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
                        {tLocal.title1} <span className="text-red-600">{tLocal.title2}</span>
                    </h1>
                    <p className="text-gray-400 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                        {tLocal.desc}
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-10 group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-red-500 transition-colors">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder={tLocal.placeholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-16 bg-[#111827]/60 backdrop-blur-xl border border-white/10 rounded-3xl pl-14 pr-6 text-white placeholder-gray-500 outline-none focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(220,38,38,0.15)] transition-all font-medium text-sm md:text-base"
                    />
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategory(cat.id);
                                    setOpenIndex(null); // Close active accordion
                                }}
                                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs md:text-sm font-bold border transition-all shrink-0 active:scale-95 ${
                                    isSelected
                                        ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/35"
                                        : "bg-[#1E293B]/40 border-white/5 text-gray-400 hover:bg-[#1E293B]/60 hover:text-white"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Accordion Questions List */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {filteredFAQs.map((faq, idx) => {
                            const isOpen = openIndex === idx;
                            return (
                                <motion.div
                                    key={idx}
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    className={`border border-white/5 rounded-3xl overflow-hidden transition-all duration-300 ${
                                        isOpen ? "bg-white/5 border-white/10" : "bg-[#111827]/40 hover:bg-[#111827]/70"
                                    }`}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : idx)}
                                        className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 font-bold text-sm md:text-base text-white"
                                    >
                                        <span>{faq.q}</span>
                                        <ChevronRight
                                            className={`w-5 h-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                                                isOpen ? "rotate-90 text-red-500" : ""
                                            }`}
                                        />
                                    </button>
                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                            >
                                                <div className="px-6 pb-6 pt-1 text-xs md:text-sm text-gray-400 leading-relaxed font-medium">
                                                    {faq.a}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {filteredFAQs.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No FAQ found.
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
