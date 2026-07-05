export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string;
  keywords: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "meilleure-station-escale-repos-missour-tandit",
    title: "La meilleure Station Service et Escale de Repos entre Missour et Tandit",
    excerpt: "Découvrez pourquoi Golden Parc Station est l'endroit parfait pour faire le plein, se reposer et manger sur la route nationale 15 (RN15).",
    date: "2026-07-05",
    image: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/cepsa-hero.jpg",
    keywords: ["Station service Missour", "Escale Tandit", "Repos RN15", "Golden Parc", "Outat El Haj"],
    content: `
      <h2>Une escale incontournable sur la RN15</h2>
      <p>Si vous voyagez entre <strong>Missour</strong> et <strong>Tandit</strong> sur la Route Nationale 15, trouver un endroit sûr et propre pour se reposer est primordial. <strong>Golden Parc Station GPS</strong> offre bien plus qu'une simple station-service Cepsa. C'est un complexe complet pensé pour le confort des voyageurs.</p>
      
      <h3>Carburant Cepsa et Entretien Auto</h3>
      <p>Nous proposons des carburants de haute qualité et un service de vidange avec les meilleurs lubrifiants pour garantir la santé de votre moteur lors de vos longs trajets dans la région de <strong>Fès-Meknès</strong>.</p>
      
      <h3>Espaces verts et Détente en famille</h3>
      <p>Fatigués par la route ? ("Bghiti trab rta7 m3a wlidatak ?") Notre station dispose de vastes <strong>espaces verts</strong> sécurisés où les enfants peuvent se dégourdir les jambes. C'est l'endroit idéal ("Ahsan blasa") pour une pause café ou un déjeuner en plein air.</p>

      <h3>Où nous trouver ?</h3>
      <p>Nous sommes situés à l'entrée de <strong>Outat El Haj</strong>, un emplacement stratégique pour tous les usagers de la route reliant Guercif, Missour et Midelt.</p>
    `
  },
  {
    slug: "hotel-escale-outat-el-haj-confort",
    title: "Hôtel L'Escale : Votre séjour de confort absolu à Outat El Haj",
    excerpt: "Des chambres luxueuses, climatisées et calmes pour une nuit réparatrice ou une sieste en journée près de Missour.",
    date: "2026-07-04",
    image: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/hotel-room.jpg",
    keywords: ["Hôtel Outat El Haj", "Hôtel Missour", "Chambre RN15", "Dormir Outat El Haj", "Hôtel L'Escale"],
    content: `
      <h2>Le meilleur hébergement de la région</h2>
      <p>Trouver un hôtel propre, moderne et sécurisé près de <strong>Missour</strong> et <strong>Tandit</strong> peut être un défi. L'<strong>Hôtel L'Escale</strong>, situé au sein du complexe Golden Parc, résout ce problème en offrant des standards hôteliers internationaux en plein cœur de la région de Boulemane.</p>
      
      <h3>Des chambres adaptées à tous vos besoins</h3>
      <p>Que vous soyez un professionnel en déplacement, ou une famille en vacances, nous avons ce qu'il vous faut :</p>
      <ul>
        <li><strong>Chambres Single et Double</strong> : Confortables et équipées de Smart TV et Wi-Fi haut débit.</li>
        <li><strong>Suites Familiales</strong> : Spacieuses pour accueillir toute la famille en toute sérénité.</li>
        <li><strong>Formule Nuit ou Sieste</strong> : Besoin de vous reposer juste quelques heures avant de reprendre la route vers <strong>Guercif</strong> ou <strong>Midelt</strong> ? Profitez de notre tarif "Sieste" exclusif.</li>
      </ul>
      
      <h3>Réservez en ligne</h3>
      <p>Plus besoin de chercher ("Thna mn t9lab"), vous pouvez vérifier la disponibilité et réserver directement sur notre site web avec une confirmation instantanée.</p>
    `
  },
  {
    slug: "restaurant-gastronomique-piscine-outat-el-haj",
    title: "Restaurant Gastronomique et Piscine : Une oasis à Outat El Haj",
    excerpt: "Profitez d'un menu varié, de viandes grillées et d'une piscine rafraîchissante lors de votre passage sur la RN15.",
    date: "2026-07-03",
    image: "https://vktqecgylkjogquhsymz.supabase.co/storage/v1/object/public/images/restaurant-hero.jpg",
    keywords: ["Restaurant Outat El Haj", "Restaurant Missour", "Manger Tandit", "Piscine Outat El Haj", "Espace vert"],
    content: `
      <h2>Une pause gourmande inoubliable</h2>
      <p>Le <strong>Restaurant Golden Parc</strong> est la destination culinaire par excellence de la région. Situé idéalement pour les voyageurs de <strong>Missour</strong>, <strong>Tandit</strong> et <strong>Boulemane</strong>, notre restaurant propose un menu riche mêlant cuisine marocaine authentique et plats internationaux.</p>
      
      <h3>Viandes fraîches et Grillades</h3>
      <p>Nous sélectionnons avec soin nos viandes pour vous offrir les meilleures grillades de la RN15. Accompagnez votre repas de nos jus frais ou d'un café premium dans notre espace salon de thé.</p>
      
      <h3>Piscine et Espaces de Loisirs</h3>
      <p>Durant les chaudes journées d'été, quoi de mieux qu'un plongeon rafraîchissant ? Notre <strong>piscine</strong> surveillée est ouverte pour les clients de l'hôtel et les visiteurs. Entourée d'<strong>espaces verts</strong>, elle offre un cadre relaxant incomparable dans la région.</p>

      <p>Rejoignez-nous au complexe <strong>Golden Parc Station GPS</strong> et transformez votre trajet en une véritable expérience de vacances.</p>
    `
  }
];
