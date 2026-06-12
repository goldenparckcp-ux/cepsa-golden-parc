# 🚀 GUIDE TECHNIQUE ET DE PRODUCTION - CEPSA GOLDEN PARK

Ce document est le guide de référence complet pour l'application **Cepsa Golden Park**. Il définit les fonctionnalités de l'application, détaille l'architecture des pages visibles et d'administration (cachées), explique comment tester l'ensemble du système et dresse la liste des documents légaux nécessaires pour intégrer les systèmes de paiement en production.

---

## 🎯 1. DÉFINITION ET VISION DE L'APPLICATION

**Cepsa Golden Park** est une application web progressive (PWA) conçue pour une station-service d'autoroute haut de gamme. Elle permet aux voyageurs fatigués et aux familles de commander des repas, réserver des chambres d'hôtel pour se reposer, acheter des accès piscine, et réserver des créneaux d'entretien mécanique en toute simplicité.

L'application repose sur un principe de **fluidité maximale** :
* **Accès rapide (Guest-First) :** L'utilisateur peut explorer l'ensemble des services, personnaliser ses commandes ou réservations sans avoir à créer un compte au préalable.
* **Authentification simplifiée :** Une vérification par e-mail ou par mot de passe/téléphone n'est requise qu'au moment de valider la commande (checkout).
* **Support PWA complet :** L'application est installable sur smartphone avec son icône dédiée (le logo Cepsa) et des écrans optimisés pour le format mobile (Standalone).

---

## 🌟 2. FONCTIONNALITÉS ET COMPOSANTS DU SYSTÈME

L'application regroupe 4 espaces principaux et un module de profil utilisateur :

### A. Restaurant (Gastronomie)
* **Menu digital :** Présentation des catégories (Fast Food, Plats & Beldi, Ftour, Salades, Boissons, Desserts).
* **Personnalisation avancée :** Fiche produit avec options (choix de la taille, suppléments, sauces) et note de préparation personnalisée.
* **Gestion des quantités :** Sélecteur de quantité directement disponible dans la fiche produit et dans le panier pour ajuster sa commande.
* **Espace de Livraison flexible :**
  * *Sur Place :* Sélection précise de l'emplacement (Table, Piscine, ou Chambre d'Hôtel). Possibilité de scanner un QR Code sur place pour détecter automatiquement le numéro.
  * *À Emporter (En Route) :* Indication de l'heure d'arrivée estimée (options de 10 min à 1 h, ou heure personnalisée).

### B. Hôtel (Repos Express)
* **Formules flexibles :** Toggles de réservation pour "Ce soir" ou "Demain".
* **Options de séjour :** Choix entre une "Sieste" (durée de 3h, tarif réduit) ou une "Nuitée complète".
* **Sélection de chambre :** Standard, Deluxe, Suite, ou Familiale avec calcul dynamique des prix selon le nombre de voyageurs et de nuits.

### C. Piscine (Lounge & Détente)
* **Choix de l'ambiance :** Réservation d'accès selon l'ambiance (Famille, Mixte, Femmes).
* **Calculateur d'accès :** Saisie du nombre d'adultes et d'enfants avec calcul instantané du tarif.

### D. Services & Lubrifiants (Entretien)
* **Réservation de créneaux :** Prise de rendez-vous pour la vidange ("Lubrifiants") avec sélection de la date et du créneau horaire disponible.

### E. Profil Utilisateur & Suivi
* **Historique d'activité :** Liste complète de toutes les commandes et réservations passées (non annulées).
* **Détails complets :** Les cartes d'activité affichent la liste exhaustive des articles, prix, et détails d'emplacement sans coupure de texte.
* **QR Code Modal :** Un modal premium qui affiche le code QR de la commande avec un récapitulatif complet de chaque article, quantité, options, et instructions pour faciliter la validation physique par le personnel de la station.

---

## 🖥️ 3. LES PAGES CACHÉES ET L'ADMINISTRATION (CODE, BUT ET LOGIQUE)

L'application comporte des espaces réservés à l'équipe et à l'administration, accessibles via des URL spécifiques. En voici les détails complets :

---

### A. Portail d'Authentification Staff
* **Chemin d'accès (Route) :** [`/staff`](file:///c:/Users/lv/OneDrive/Desktop/woork/golden%20parck%20cepsa/cepsa-golden-park/app/staff/page.tsx)
* **Fichier Source :** `app/staff/page.tsx`
* **But :** Permettre aux employés de la station de se connecter rapidement via un pavé numérique (PIN) sur des tablettes dédiées.
* **Fonctionnement du Code :**
  * Gère un état local `pin` à 4 chiffres.
  * Déclenche un hook `useEffect` pour valider le code dès que sa longueur atteint 4 caractères.
  * Compare le code PIN saisi avec les valeurs par défaut stockées localement ou configurées :
    * **Hôtel :** `1111` ➜ redirige vers `/staff/hotel`
    * **Cuisine (Restaurant) :** `2222` ➜ redirige vers `/staff/restaurant`
    * **Piscine & Services :** `3333` ➜ redirige vers `/staff/pool-services`
    * **Caisse Principale :** `4444` ➜ redirige vers `/staff/caisse`
    * **Administrateur :** `7777` ➜ Affiche un avertissement demandant d'utiliser le portail Admin.
  * Sauvegarde la session dans le `localStorage` sous la clé `staff_session` au format JSON : `{ role: '...', name: '...' }`.

---

### B. Espace Cuisine (Staff Restaurant)
* **Chemin d'accès (Route) :** [`/staff/restaurant`](file:///c:/Users/lv/OneDrive/Desktop/woork/golden%20parck%20cepsa/cepsa-golden-park/app/staff/restaurant/page.tsx)
* **Fichier Source :** `app/staff/restaurant/page.tsx`
* **But :** Permettre aux cuisiniers de suivre les commandes en cours de préparation en temps réel.
* **Fonctionnement du Code :**
  * **Accès Sécurisé :** Vérifie que la session `staff_session` dans le `localStorage` possède le rôle `kitchen` ou `admin`. Sinon, redirige vers `/staff`.
  * **Temps Réel (Real-time) :** S'abonne aux modifications de la table `restaurant_orders` via Supabase Realtime API (`supabase.channel("staff-kitchen-orders-changes")`) pour capter instantanément les nouvelles commandes.
  * **Alertes Sonores :** Joue un son d'avertissement (`new Audio(...)` avec un fichier Mixkit) lors de l'arrivée d'une nouvelle commande (si l'option sonore est activée).
  * **Tri intelligent par urgence :** Calcule dynamiquement le temps restant en minutes pour les commandes de type "À Emporter (En Route)". Si le temps restant est inférieur à 30 minutes, la commande est affichée en haut de liste avec un badge rouge clignotant.
  * **Résolution d'emplacement :** Interprète le JSON de livraison pour afficher l'emplacement exact en texte lisible (ex: **Sur Place - Table N° 12** ou **Livraison Chambre 104**).
  * **Transition des états :** Offre des boutons interactifs pour changer le statut de la commande dans Supabase :
    * *Pending* (En attente) ➜ *Preparing* (En cuisine) ➜ *Ready* (Prête / Informer Serveur) ➜ *Completed* (Servie & Encaissée) ➜ *Archive*.

---

### C. Tableau de Bord Admin (Statistiques Globales)
* **Chemin d'accès (Route) :** [`/admin`](file:///c:/Users/lv/OneDrive/Desktop/woork/golden%20parck%20cepsa/cepsa-golden-park/app/admin/page.tsx)
* **Fichier Source :** `app/admin/page.tsx`
* **But :** Fournir au directeur ou gérant de la station une vue d'ensemble sur les performances financières, l'activité de tous les espaces et des recommandations basées sur l'Intelligence Artificielle.
* **Fonctionnement du Code :**
  * **Contrôle d'accès :** Géré par le layout [`app/admin/layout.tsx`](file:///c:/Users/lv/OneDrive/Desktop/woork/golden%20parck%20cepsa/cepsa-golden-park/app/admin/layout.tsx) qui impose la saisie du code PIN administrateur (`7777`) ou valide l'utilisateur via la table `staff` dans Supabase.
  * **KPI Cards :** Affiche des indicateurs clés (chiffre d'affaires cumulé, nombre total de ventes, taux d'occupation hôtel, file d'attente cuisine) avec des graphiques miniatures de type Sparkline (générés dynamiquement via du code SVG en ligne).
  * **Graphique SVG Interactif (Multi-catégories) :** Construit un graphique linéaire vectoriel interactif de A à Z.
    * Un système d'onglets permet de filtrer les revenus par service : **Global**, **Restaurant**, **Hôtel**, **Piscine**.
    * Calcule une marge d'échelle de 25% au-dessus de la valeur maximale (`max * 1.25`) pour éviter que les info-bulles (tooltips) et les cercles de survol soient coupés en haut du graphique SVG.
    * Les points de données sont cliquables et affichent les détails exacts en DH.
  * **Gemini AI Business Advisor :** Fait appel à l'API de Gemini (`Google Generative AI`) pour analyser les chiffres réels de vente de la station. Il fournit un rapport analytique complet contenant des recommandations d'optimisation (meilleures heures de service, offres groupées Resto+Piscine, etc.). Le code filtre explicitement les données pour ignorer le service "Lavage Auto" (définitivement fermé et archivé).

---

### D. Gestion Tarification Admin
* **Chemin d'accès (Route) :** `/admin/prices`
* **Fichier Source :** `app/admin/prices/page.tsx`
* **But :** Permettre à l'administrateur de modifier à la volée les prix de base des chambres d'hôtel, des accès piscine et des formules d'entretien.
* **Fonctionnement du Code :**
  * Affiche des formulaires de mise à jour pour chaque catégorie tarifaire.
  * Enregistre les modifications directement dans la table de configuration de Supabase, mettant à jour instantanément les tarifs pour les clients sur la partie publique.

---

### E. Générateur de QR Codes
* **Chemin d'accès (Route) :** `/admin/qrcodes`
* **Fichier Source :** `app/admin/qrcodes/page.tsx`
* **But :** Générer des QR Codes uniques associés à des emplacements physiques précis de la station (Tables de restaurant, transats de la piscine, chambres d'hôtel).
* **Fonctionnement du Code :**
  * Gère l'affichage et la création d'emplacements.
  * Génère un jeton (token) unique pour chaque emplacement et l'enregistre dans la table `qr_locations`.
  * Affiche un QR Code prêt à être imprimé. Ce code pointe vers l'URL : `https://votre-domaine.com/scan?t=[token_unique]`.

---

### F. Page de Routage et Validation de QR Code
* **Chemin d'accès (Route) :** [`/scan`](file:///c:/Users/lv/OneDrive/Desktop/woork/golden%20parck%20cepsa/cepsa-golden-park/app/scan/page.tsx)
* **Fichier Source :** `app/scan/page.tsx`
* **But :** Identifier automatiquement la table ou la chambre d'un client lorsqu'il scanne le QR code physique avec son smartphone.
* **Fonctionnement du Code :**
  * Extrait le paramètre `t` de l'URL (`useSearchParams`).
  * Effectue une requête Supabase sur la table `qr_locations` avec le filtre `.eq("token", token).eq("is_active", true).maybeSingle()`.
  * Si le token est valide, l'application enregistre les données de localisation dans le stockage de session du navigateur (`sessionStorage.setItem("scan_location", ...)`).
  * Redirige automatiquement le client vers le menu de commande du Restaurant ([`/restaurant`](file:///c:/Users/lv/OneDrive/Desktop/woork/golden%20parck%20cepsa/cepsa-golden-park/app/restaurant)) en pré-remplissant et verrouillant son emplacement (ex: "Table 12").

---

### G. Mode Drive-In (Commande rapide en voiture)
* **Chemin d'accès (Route) :** [`/drive`](file:///c:/Users/lv/OneDrive/Desktop/woork/golden%20parck%20cepsa/cepsa-golden-park/app/drive/page.tsx)
* **Fichier Source :** `app/drive/page.tsx`
* **But :** Permettre aux clients arrivant en voiture de commander ultra-rapidement depuis une borne extérieure ou leur téléphone en voiture.
* **Fonctionnement du Code :**
  * Présente une interface sombre à fort contraste et très épurée (boutons géants et textes en gras) conçue pour être manipulée facilement, même en conduisant ou depuis un support de voiture.
  * Liste les 10 produits phares les plus vendus de la station.
  * Permet d'ajouter des produits au panier en un seul clic sans passer par l'étape de personnalisation complexe.
  * Un bouton géant "Valider" permet de basculer vers le flux de paiement pour clore la commande instantanément.

---

## 🧪 4. GUIDE DE TEST ET PROTOCOLE DE VALIDATION ÉTAPE PAR ÉTAPE

Pour tester l'intégralité du flux de l'application et s'assurer que toutes les intégrations fonctionnent correctement, suivez ce protocole :

### Étape 1 : Tester le flux Table (Dine-In)
1. Ouvrez l'adresse de l'application en simulant un scan de QR Code de la Table 12 : `http://localhost:3000/scan?t=token_table_12` (ou accédez directement via `http://localhost:3000/restaurant?table=12`).
2. Vérifiez qu'une bannière bleue apparaît en haut de l'écran du restaurant indiquant : "📍 Commande pour Table 12".
3. Sélectionnez un produit (ex: *Tacos Sur Mesure*).
4. Choisissez les options de personnalisation, ajoutez 2 suppléments, réglez la quantité à `2` et cliquez sur "Ajouter au Panier".
5. Ouvrez le panier (bouton flottant en bas à droite) : vérifiez que le produit s'affiche avec la mention `2 x [Prix unitaire] (Total)`.

### Étape 2 : Valider le Panier et l'Emplacement
1. Dans le panier, cliquez sur le bouton de sélection de la destination "Sur Place".
2. Par défaut, la table "12" scannée doit déjà être pré-renseignée et verrouillée.
3. Cochez la case d'acceptation des conditions générales de vente.
4. Sélectionnez le mode de paiement "Sur Place (Cash / Carte au serveur)" pour valider le test sans saisie bancaire.
5. Cliquez sur "Confirmer la commande". 
6. Si vous n'êtes pas connecté, l'application vous redirigera vers la page de profil/connexion. Connectez-vous (via e-mail de test), puis finalisez la commande.
7. Un écran de succès vert s'affiche montrant le numéro de la commande (ex: `CMD-123456`).

### Étape 3 : Suivi Cuisine (Staff)
1. Ouvrez un nouvel onglet de navigateur en mode privé et accédez à `/staff`.
2. Saisissez le code PIN cuisine `2222`.
3. Vous êtes redirigé vers la page `/staff/restaurant`.
4. La commande `CMD-123456` doit apparaître dans l'onglet **Nouveaux** avec un contour orange. Le détail de livraison doit afficher **Sur Place (Table)** et **Table N° 12**.
5. Cliquez sur **Lancer Cuisine**. La commande passe dans l'onglet **En Cuisine** (le statut Supabase passe à `preparing`).
6. Cliquez sur **Prêt ! (Informer Serveur)**. La commande passe dans l'onglet **Prêts** (le statut Supabase passe à `ready`).
7. Cliquez sur **Servi & Encaissé**. La commande passe dans l'**Archive** (le statut Supabase passe à `completed`).

### Étape 4 : Suivi Client (Profil)
1. Retournez sur l'onglet client sur la page `/profile`.
2. Dans la section "Activité Récente", la commande doit être visible avec son statut mis à jour en temps réel (Servi & Encaissé). Les détails textuels doivent être entièrement visibles sans être tronqués.
3. Cliquez sur l'icône de QR Code : vérifiez que le modal affiche le code de réservation en grand, avec la liste détaillée des plats, suppléments, quantités, notes et l'emplacement de livraison.

---

## 📄 5. DOCUMENTS REQUIS POUR L'INTEGRATION ET LE PASSAGE EN PRODUCTION

Pour pouvoir activer les intégrations de paiement en ligne (PayPal, Stripe ou CMI) et la connexion Facebook Login en mode public (production), vous devez préparer les documents et identifiants professionnels suivants :

### A. Comptes Marchands et Passerelles de Paiement (PayPal Business / Stripe / CMI)
Les passerelles de paiement exigent la création d'un compte professionnel vérifié. Les documents requis au Maroc sont :
1. **Registre de Commerce (RC) :** Le Modèle 7 récent (datant de moins de 3 mois) de votre entreprise.
2. **Statuts de la Société :** Copie conforme des statuts de la société signée et légalisée.
3. **Identifiant Fiscal (IF) & Patente :** Attestation d'inscription à la taxe professionnelle et numéro d'identifiant fiscal.
4. **Déclaration d'existence :** Document officiel délivré par la direction des impôts lors de la création.
5. **Relevé d'Identité Bancaire (RIB) :** Un RIB officiel de la banque de l'entreprise (format 24 chiffres) pour recevoir les virements des fonds collectés en ligne.
6. **Pièce d'identité du gérant légal :** Copie de la CIN (Carte d'Identité Nationale) ou du passeport du gérant ou représentant légal mentionné sur le RC.

### B. Connexion Facebook (Facebook Developer Platform)
Pour passer l'application de connexion Facebook en mode "Production" (Public Live) :
1. **Vérification de l'entreprise (Meta Business Suite) :** 
   * Vous devez lier votre application de connexion à un gestionnaire d'entreprise Meta vérifié (Meta Business Manager).
   * *Documents requis par Meta :* Certificat d'enregistrement de l'entreprise (RC ou statuts) et un justificatif d'adresse au nom de la société (facture d'électricité, de téléphone, ou relevé bancaire).
2. **Politique de Confidentialité :** Lien public et valide vers la page de politique de confidentialité de votre site web (ex: `https://votre-domaine.com/privacy`).
3. **Conditions d'utilisation :** Lien valide vers vos conditions d'utilisation (ex: `https://votre-domaine.com/terms`).

---

## 📈 6. NOTE FINALE ET PROCHAINES ÉTAPES

> [!IMPORTANT]
> **En attente de Validation :**
> Nous sommes actuellement en attente de votre feu vert pour passer aux étapes clés de visibilité et de mise en ligne définitive :
> 1. **Achat et configuration du Nom de Domaine définitif** (liaison DNS avec l'hébergement Vercel).
> 2. **Optimisation SEO complète** (Indexation Google Search Console, configuration du fichier `sitemap.xml`, configuration du fichier `robots.txt`, balises Meta OpenGraph optimisées) afin de s'assurer que l'application de la station se positionne en **première place** dans les résultats de recherche Google pour les voyageurs à proximité.
