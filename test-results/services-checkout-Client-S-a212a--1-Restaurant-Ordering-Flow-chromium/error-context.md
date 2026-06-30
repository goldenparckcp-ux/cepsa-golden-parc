# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: services-checkout.spec.ts >> Client Services Checkout E2E Flows >> 1. Restaurant Ordering Flow
- Location: tests\services-checkout.spec.ts:156:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Ajouter au Panier")') to be visible

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e5]:
    - img [ref=e7]
    - generic [ref=e12]:
      - heading "Menu" [level=1] [ref=e13]
      - paragraph [ref=e14]: Restaurant & Café
  - generic [ref=e16]:
    - generic [ref=e17] [cursor=pointer]:
      - img "Tajine Marocain"
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: 🌟 Offre Spéciale
          - heading "Tajine Marocain" [level=2] [ref=e22]
          - paragraph [ref=e23]: Cuit lentement sur charbon (Fekhar).
        - generic [ref=e24]:
          - generic [ref=e25]:
            - generic [ref=e26]: Prix Spécial
            - generic [ref=e27]: 35.00 DH
          - button "Commander" [ref=e28]:
            - img [ref=e29]
            - generic [ref=e30]: Commander
    - generic [ref=e31] [cursor=pointer]:
      - img "Salade de fruit"
      - generic [ref=e33]:
        - generic [ref=e34]:
          - generic [ref=e35]: 🌟 Offre Spéciale
          - heading "Salade de fruit" [level=2] [ref=e36]
          - paragraph [ref=e37]: Cocktail de fruits de saison fraîchement coupés.
        - generic [ref=e38]:
          - generic [ref=e39]:
            - generic [ref=e40]: Prix Spécial
            - generic [ref=e41]: 40.00 DH
          - button "Commander" [ref=e42]:
            - img [ref=e43]
            - generic [ref=e44]: Commander
    - generic [ref=e45] [cursor=pointer]:
      - img "Za3za3"
      - generic [ref=e47]:
        - generic [ref=e48]:
          - generic [ref=e49]: 🌟 Offre Spéciale
          - heading "Za3za3" [level=2] [ref=e50]
          - paragraph [ref=e51]: Cocktail avocat, fruits, crème et fruits secs.
        - generic [ref=e52]:
          - generic [ref=e53]:
            - generic [ref=e54]: Prix Spécial
            - generic [ref=e55]: 25.00 DH
          - button "Commander" [ref=e56]:
            - img [ref=e57]
            - generic [ref=e58]: Commander
    - generic [ref=e59] [cursor=pointer]:
      - img "Pizza Personnalisée"
      - generic [ref=e61]:
        - generic [ref=e62]:
          - generic [ref=e63]: 🌟 Offre Spéciale
          - heading "Pizza Personnalisée" [level=2] [ref=e64]
          - paragraph [ref=e65]: Créez votre pizza parfaite avec la pâte et les garnitures de votre choix.
        - generic [ref=e66]:
          - generic [ref=e67]:
            - generic [ref=e68]: Prix Spécial
            - generic [ref=e69]: 20.00 DH
          - button "Commander" [ref=e70]:
            - img [ref=e71]
            - generic [ref=e72]: Commander
    - generic [ref=e73] [cursor=pointer]:
      - img "Tacos Sur Mesure"
      - generic [ref=e75]:
        - generic [ref=e76]:
          - generic [ref=e77]: 🌟 Offre Spéciale
          - heading "Tacos Sur Mesure" [level=2] [ref=e78]
          - paragraph [ref=e79]: Votre Tacos avec frites et sauce fromagère maison.
        - generic [ref=e80]:
          - generic [ref=e81]:
            - generic [ref=e82]: Prix Spécial
            - generic [ref=e83]: 30.00 DH
          - button "Commander" [ref=e84]:
            - img [ref=e85]
            - generic [ref=e86]: Commander
    - generic [ref=e87] [cursor=pointer]:
      - img "ggfgfhh"
      - generic [ref=e89]:
        - generic [ref=e90]:
          - generic [ref=e91]: 🌟 Offre Spéciale
          - heading "ggfgfhh" [level=2] [ref=e92]
          - paragraph [ref=e93]: sff
        - generic [ref=e94]:
          - generic [ref=e95]:
            - generic [ref=e96]: Prix Spécial
            - generic [ref=e97]: 35.00 DH
          - button "Commander" [ref=e98]:
            - img [ref=e99]
            - generic [ref=e100]: Commander
  - button "Filtrer par catégorie" [ref=e110] [cursor=pointer]:
    - img [ref=e111]
  - generic [ref=e113]:
    - button "Ftour Complet 35.00 DH Ftour Complet Petit déjeuner complet traditionnel." [active] [ref=e114] [cursor=pointer]:
      - generic [ref=e115]:
        - img "Ftour Complet" [ref=e116]
        - generic [ref=e118]:
          - generic [ref=e119]: 35.00 DH
          - img [ref=e121]
      - generic [ref=e122]:
        - heading "Ftour Complet" [level=3] [ref=e123]
        - paragraph [ref=e124]: Petit déjeuner complet traditionnel.
    - button "Omelette 15.00 DH Omelette Œufs de ferme préparés à votre goût." [ref=e125] [cursor=pointer]:
      - generic [ref=e126]:
        - img "Omelette" [ref=e127]
        - generic [ref=e129]:
          - generic [ref=e130]: 15.00 DH
          - img [ref=e132]
      - generic [ref=e133]:
        - heading "Omelette" [level=3] [ref=e134]
        - paragraph [ref=e135]: Œufs de ferme préparés à votre goût.
    - button "Crêpes & Galettes Chaudes 10.00 DH Crêpes & Galettes Chaudes Assortiment de Baghrir, Msamen, Harcha." [ref=e136] [cursor=pointer]:
      - generic [ref=e137]:
        - img "Crêpes & Galettes Chaudes" [ref=e138]
        - generic [ref=e140]:
          - generic [ref=e141]: 10.00 DH
          - img [ref=e143]
      - generic [ref=e144]:
        - heading "Crêpes & Galettes Chaudes" [level=3] [ref=e145]
        - paragraph [ref=e146]: Assortiment de Baghrir, Msamen, Harcha.
    - button "Couscous (Vendredi) Spécialité 30.00 DH Couscous (Vendredi) Plat traditionnel marocain, servi uniquement le vendredi." [ref=e147] [cursor=pointer]:
      - generic [ref=e148]:
        - img "Couscous (Vendredi)" [ref=e149]
        - generic [ref=e150]: Spécialité
        - generic [ref=e152]:
          - generic [ref=e153]: 30.00 DH
          - img [ref=e155]
      - generic [ref=e156]:
        - heading "Couscous (Vendredi)" [level=3] [ref=e157]
        - paragraph [ref=e158]: Plat traditionnel marocain, servi uniquement le vendredi.
    - button "Pâtes 30.00 DH Pâtes Spaghetti ou Penne servis avec votre sauce préférée." [ref=e159] [cursor=pointer]:
      - generic [ref=e160]:
        - img "Pâtes" [ref=e161]
        - generic [ref=e163]:
          - generic [ref=e164]: 30.00 DH
          - img [ref=e166]
      - generic [ref=e167]:
        - heading "Pâtes" [level=3] [ref=e168]
        - paragraph [ref=e169]: Spaghetti ou Penne servis avec votre sauce préférée.
    - button "Poulet Rôti (Djaj Mhamer) 40.00 DH Poulet Rôti (Djaj Mhamer) Poulet rôti à la marocaine avec frites et olives." [ref=e170] [cursor=pointer]:
      - generic [ref=e171]:
        - img "Poulet Rôti (Djaj Mhamer)" [ref=e172]
        - generic [ref=e174]:
          - generic [ref=e175]: 40.00 DH
          - img [ref=e177]
      - generic [ref=e178]:
        - heading "Poulet Rôti (Djaj Mhamer)" [level=3] [ref=e179]
        - paragraph [ref=e180]: Poulet rôti à la marocaine avec frites et olives.
    - button "Tajine Marocain Beldi 35.00 DH Tajine Marocain Cuit lentement sur charbon (Fekhar)." [ref=e181] [cursor=pointer]:
      - generic [ref=e182]:
        - img "Tajine Marocain" [ref=e183]
        - generic [ref=e184]: Beldi
        - generic [ref=e186]:
          - generic [ref=e187]: 35.00 DH
          - img [ref=e189]
      - generic [ref=e190]:
        - heading "Tajine Marocain" [level=3] [ref=e191]
        - paragraph [ref=e192]: Cuit lentement sur charbon (Fekhar).
    - button "Cafétéria 10.00 DH Cafétéria Boissons chaudes premium." [ref=e193] [cursor=pointer]:
      - generic [ref=e194]:
        - img "Cafétéria" [ref=e195]
        - generic [ref=e197]:
          - generic [ref=e198]: 10.00 DH
          - img [ref=e200]
      - generic [ref=e201]:
        - heading "Cafétéria" [level=3] [ref=e202]
        - paragraph [ref=e203]: Boissons chaudes premium.
    - button "Jus Frais 10.00 DH Jus Frais Pressé minute, 100% fruits." [ref=e204] [cursor=pointer]:
      - generic [ref=e205]:
        - img "Jus Frais" [ref=e206]
        - generic [ref=e208]:
          - generic [ref=e209]: 10.00 DH
          - img [ref=e211]
      - generic [ref=e212]:
        - heading "Jus Frais" [level=3] [ref=e213]
        - paragraph [ref=e214]: Pressé minute, 100% fruits.
    - button "Soda & Eau 5.00 DH Soda & Eau Boissons fraîches." [ref=e215] [cursor=pointer]:
      - generic [ref=e216]:
        - img "Soda & Eau" [ref=e217]
        - generic [ref=e219]:
          - generic [ref=e220]: 5.00 DH
          - img [ref=e222]
      - generic [ref=e223]:
        - heading "Soda & Eau" [level=3] [ref=e224]
        - paragraph [ref=e225]: Boissons fraîches.
    - button "Flan Amlou Local 15.00 DH Flan Amlou Flan onctueux parfumé à la pâte d'Amlou." [ref=e226] [cursor=pointer]:
      - generic [ref=e227]:
        - img "Flan Amlou" [ref=e228]
        - generic [ref=e229]: Local
        - generic [ref=e231]:
          - generic [ref=e232]: 15.00 DH
          - img [ref=e234]
      - generic [ref=e235]:
        - heading "Flan Amlou" [level=3] [ref=e236]
        - paragraph [ref=e237]: Flan onctueux parfumé à la pâte d'Amlou.
    - button "Salade de fruit Frais 40.00 DH Salade de fruit Cocktail de fruits de saison fraîchement coupés." [ref=e238] [cursor=pointer]:
      - generic [ref=e239]:
        - img "Salade de fruit" [ref=e240]
        - generic [ref=e241]: Frais
        - generic [ref=e243]:
          - generic [ref=e244]: 40.00 DH
          - img [ref=e246]
      - generic [ref=e247]:
        - heading "Salade de fruit" [level=3] [ref=e248]
        - paragraph [ref=e249]: Cocktail de fruits de saison fraîchement coupés.
    - button "Za3za3 Énergie 25.00 DH Za3za3 Cocktail avocat, fruits, crème et fruits secs." [ref=e250] [cursor=pointer]:
      - generic [ref=e251]:
        - img "Za3za3" [ref=e252]
        - generic [ref=e253]: Énergie
        - generic [ref=e255]:
          - generic [ref=e256]: 25.00 DH
          - img [ref=e258]
      - generic [ref=e259]:
        - heading "Za3za3" [level=3] [ref=e260]
        - paragraph [ref=e261]: Cocktail avocat, fruits, crème et fruits secs.
    - button "Burger Maison 20.00 DH Burger Maison Steak haché de boeuf, salade, tomate, oignons, sauce burger." [ref=e262] [cursor=pointer]:
      - generic [ref=e263]:
        - img "Burger Maison" [ref=e264]
        - generic [ref=e266]:
          - generic [ref=e267]: 20.00 DH
          - img [ref=e269]
      - generic [ref=e270]:
        - heading "Burger Maison" [level=3] [ref=e271]
        - paragraph [ref=e272]: Steak haché de boeuf, salade, tomate, oignons, sauce burger.
    - button "Panini Pressé 15.00 DH Panini Pressé Pain ciabatta, fromage fondant, garniture au choix." [ref=e273] [cursor=pointer]:
      - generic [ref=e274]:
        - img "Panini Pressé" [ref=e275]
        - generic [ref=e277]:
          - generic [ref=e278]: 15.00 DH
          - img [ref=e280]
      - generic [ref=e281]:
        - heading "Panini Pressé" [level=3] [ref=e282]
        - paragraph [ref=e283]: Pain ciabatta, fromage fondant, garniture au choix.
    - button "Pasticcio & Lasagnes Gourmand 25.00 DH Pasticcio & Lasagnes Plats au four gratinés." [ref=e284] [cursor=pointer]:
      - generic [ref=e285]:
        - img "Pasticcio & Lasagnes" [ref=e286]
        - generic [ref=e287]: Gourmand
        - generic [ref=e289]:
          - generic [ref=e290]: 25.00 DH
          - img [ref=e292]
      - generic [ref=e293]:
        - heading "Pasticcio & Lasagnes" [level=3] [ref=e294]
        - paragraph [ref=e295]: Plats au four gratinés.
    - button "Pizza Personnalisée Populaire 20.00 DH Pizza Personnalisée Créez votre pizza parfaite avec la pâte et les garnitures de votre choix." [ref=e296] [cursor=pointer]:
      - generic [ref=e297]:
        - img "Pizza Personnalisée" [ref=e298]
        - generic [ref=e299]: Populaire
        - generic [ref=e301]:
          - generic [ref=e302]: 20.00 DH
          - img [ref=e304]
      - generic [ref=e305]:
        - heading "Pizza Personnalisée" [level=3] [ref=e306]
        - paragraph [ref=e307]: Créez votre pizza parfaite avec la pâte et les garnitures de votre choix.
    - button "Salade Fraîche 25.00 DH Salade Fraîche Légumes frais de saison." [ref=e308] [cursor=pointer]:
      - generic [ref=e309]:
        - img "Salade Fraîche" [ref=e310]
        - generic [ref=e312]:
          - generic [ref=e313]: 25.00 DH
          - img [ref=e315]
      - generic [ref=e316]:
        - heading "Salade Fraîche" [level=3] [ref=e317]
        - paragraph [ref=e318]: Légumes frais de saison.
    - button "Sandwich Classique 10.00 DH Sandwich Classique Baguette croustillante, frites, salade, garniture au choix." [ref=e319] [cursor=pointer]:
      - generic [ref=e320]:
        - img "Sandwich Classique" [ref=e321]
        - generic [ref=e323]:
          - generic [ref=e324]: 10.00 DH
          - img [ref=e326]
      - generic [ref=e327]:
        - heading "Sandwich Classique" [level=3] [ref=e328]
        - paragraph [ref=e329]: Baguette croustillante, frites, salade, garniture au choix.
    - button "Sandwich Pain Maison Signature 30.00 DH Sandwich Pain Maison Notre spécialité pain maison extra moelleux." [ref=e330] [cursor=pointer]:
      - generic [ref=e331]:
        - img "Sandwich Pain Maison" [ref=e332]
        - generic [ref=e333]: Signature
        - generic [ref=e335]:
          - generic [ref=e336]: 30.00 DH
          - img [ref=e338]
      - generic [ref=e339]:
        - heading "Sandwich Pain Maison" [level=3] [ref=e340]
        - paragraph [ref=e341]: Notre spécialité pain maison extra moelleux.
    - button "Shawarma & Cheese Naan 25.00 DH Shawarma & Cheese Naan Spécialités orientales, pain libanais ou indien au fromage." [ref=e342] [cursor=pointer]:
      - generic [ref=e343]:
        - img "Shawarma & Cheese Naan" [ref=e344]
        - generic [ref=e346]:
          - generic [ref=e347]: 25.00 DH
          - img [ref=e349]
      - generic [ref=e350]:
        - heading "Shawarma & Cheese Naan" [level=3] [ref=e351]
        - paragraph [ref=e352]: Spécialités orientales, pain libanais ou indien au fromage.
    - button "Tacos Sur Mesure Bestseller 30.00 DH Tacos Sur Mesure Votre Tacos avec frites et sauce fromagère maison." [ref=e353] [cursor=pointer]:
      - generic [ref=e354]:
        - img "Tacos Sur Mesure" [ref=e355]
        - generic [ref=e356]: Bestseller
        - generic [ref=e358]:
          - generic [ref=e359]: 30.00 DH
          - img [ref=e361]
      - generic [ref=e362]:
        - heading "Tacos Sur Mesure" [level=3] [ref=e363]
        - paragraph [ref=e364]: Votre Tacos avec frites et sauce fromagère maison.
    - button "Plat Playwright E2E 1780958139670 99.00 DH Plat Playwright E2E 1780958139670 Plat de test cree automatiquement par les tests Playwright." [ref=e365] [cursor=pointer]:
      - generic [ref=e366]:
        - img "Plat Playwright E2E 1780958139670" [ref=e367]
        - generic [ref=e369]:
          - generic [ref=e370]: 99.00 DH
          - img [ref=e372]
      - generic [ref=e373]:
        - heading "Plat Playwright E2E 1780958139670" [level=3] [ref=e374]
        - paragraph [ref=e375]: Plat de test cree automatiquement par les tests Playwright.
    - button "Plat Playwright E2E 1780958180894 99.00 DH Plat Playwright E2E 1780958180894 Plat de test cree automatiquement par les tests Playwright." [ref=e376] [cursor=pointer]:
      - generic [ref=e377]:
        - img "Plat Playwright E2E 1780958180894" [ref=e378]
        - generic [ref=e380]:
          - generic [ref=e381]: 99.00 DH
          - img [ref=e383]
      - generic [ref=e384]:
        - heading "Plat Playwright E2E 1780958180894" [level=3] [ref=e385]
        - paragraph [ref=e386]: Plat de test cree automatiquement par les tests Playwright.
    - button "Plat Playwright E2E 1780966327372 99.00 DH Plat Playwright E2E 1780966327372 Plat de test cree automatiquement par les tests Playwright." [ref=e387] [cursor=pointer]:
      - generic [ref=e388]:
        - img "Plat Playwright E2E 1780966327372" [ref=e389]
        - generic [ref=e391]:
          - generic [ref=e392]: 99.00 DH
          - img [ref=e394]
      - generic [ref=e395]:
        - heading "Plat Playwright E2E 1780966327372" [level=3] [ref=e396]
        - paragraph [ref=e397]: Plat de test cree automatiquement par les tests Playwright.
    - button "Plat Playwright E2E 1780966469617 88.00 DH Plat Playwright E2E 1780966469617 Plat de test cree automatiquement par les tests Playwright." [ref=e398] [cursor=pointer]:
      - generic [ref=e399]:
        - img "Plat Playwright E2E 1780966469617" [ref=e400]
        - generic [ref=e402]:
          - generic [ref=e403]: 88.00 DH
          - img [ref=e405]
      - generic [ref=e406]:
        - heading "Plat Playwright E2E 1780966469617" [level=3] [ref=e407]
        - paragraph [ref=e408]: Plat de test cree automatiquement par les tests Playwright.
    - button "Plat Playwright E2E 1781009120808 99.00 DH Plat Playwright E2E 1781009120808 Plat de test cree automatiquement par les tests Playwright." [ref=e409] [cursor=pointer]:
      - generic [ref=e410]:
        - img "Plat Playwright E2E 1781009120808" [ref=e411]
        - generic [ref=e413]:
          - generic [ref=e414]: 99.00 DH
          - img [ref=e416]
      - generic [ref=e417]:
        - heading "Plat Playwright E2E 1781009120808" [level=3] [ref=e418]
        - paragraph [ref=e419]: Plat de test cree automatiquement par les tests Playwright.
    - button "ggfgfhh 35.00 DH ggfgfhh sff" [ref=e420] [cursor=pointer]:
      - generic [ref=e421]:
        - img "ggfgfhh" [ref=e422]
        - generic [ref=e424]:
          - generic [ref=e425]: 35.00 DH
          - img [ref=e427]
      - generic [ref=e428]:
        - heading "ggfgfhh" [level=3] [ref=e429]
        - paragraph [ref=e430]: sff
```

# Test source

```ts
  67  |                     email: "customer-test@example.com",
  68  |                     phone: "+212600000000",
  69  |                     user_metadata: {
  70  |                         full_name: "Utilisateur E2E Test",
  71  |                         phone: "+212600000000"
  72  |                     },
  73  |                     created_at: new Date().toISOString()
  74  |                 })
  75  |             });
  76  |         });
  77  | 
  78  |         // Generic mock for all public Supabase PostgREST endpoints
  79  |         await page.route('**/rest/v1/**', async (route) => {
  80  |             const method = route.request().method();
  81  |             const url = route.request().url();
  82  |             console.log(`Intercepted Rest API [${method}]: ${url}`);
  83  |             
  84  |             if (method === 'GET') {
  85  |                 if (url.includes('/rest/v1/profiles')) {
  86  |                     await route.fulfill({
  87  |                         status: 200,
  88  |                         contentType: 'application/json',
  89  |                         body: JSON.stringify({
  90  |                             id: "550e8400-e29b-41d4-a716-446655440000",
  91  |                             full_name: "Utilisateur E2E Test",
  92  |                             phone: "0600000000",
  93  |                             email: "customer-test@example.com",
  94  |                             wallet_balance: 150
  95  |                         })
  96  |                     });
  97  |                     return;
  98  |                 }
  99  |                 if (url.includes('/rest/v1/service_bookings') ||
  100 |                     url.includes('/rest/v1/hotel_reservations') ||
  101 |                     url.includes('/rest/v1/pool_bookings') ||
  102 |                     url.includes('/rest/v1/restaurant_orders')) {
  103 |                     await route.fulfill({
  104 |                         status: 200,
  105 |                         contentType: 'application/json',
  106 |                         body: JSON.stringify([])
  107 |                     });
  108 |                     return;
  109 |                 }
  110 |                 // Pass through other GETs
  111 |                 await route.continue();
  112 |                 return;
  113 |             }
  114 | 
  115 |             // For POST/PATCH writes, return mock success data
  116 |             await route.fulfill({
  117 |                 status: 200,
  118 |                 contentType: 'application/json',
  119 |                 body: JSON.stringify({
  120 |                     id: "mock-id-12345",
  121 |                     booking_number: "BOOK-E2E-123456",
  122 |                     order_number: "CMD-E2E-123456",
  123 |                     total_price: 90,
  124 |                     status: "pending",
  125 |                     deposit_paid: true
  126 |                 })
  127 |             });
  128 |         });
  129 | 
  130 |         // Pre-set the client Supabase session in localStorage
  131 |         await page.goto('/');
  132 |         await page.evaluate(() => {
  133 |             const mockSession = {
  134 |                 access_token: "mock-jwt-token",
  135 |                 token_type: "bearer",
  136 |                 expires_in: 3600,
  137 |                 refresh_token: "mock-refresh-token",
  138 |                 user: {
  139 |                     id: "550e8400-e29b-41d4-a716-446655440000",
  140 |                     aud: "authenticated",
  141 |                     role: "authenticated",
  142 |                     email: "customer-test@example.com",
  143 |                     phone: "+212600000000",
  144 |                     user_metadata: {
  145 |                         full_name: "Utilisateur E2E Test",
  146 |                         phone: "+212600000000"
  147 |                     }
  148 |                 },
  149 |                 expires_at: Math.floor(Date.now() / 1000) + 3600
  150 |             };
  151 |             localStorage.setItem("sb-vktqecgylkjogquhsymz-auth-token", JSON.stringify(mockSession));
  152 |             localStorage.setItem("app_lang", "fr"); // Force French
  153 |         });
  154 |     });
  155 | 
  156 |     test('1. Restaurant Ordering Flow', async ({ page }) => {
  157 |         console.log("Starting Restaurant Ordering E2E...");
  158 |         await page.goto('/restaurant');
  159 | 
  160 |         // Click first available dish card
  161 |         console.log("Selecting menu item...");
  162 |         await page.waitForSelector('button:has(h3)');
  163 |         await page.locator('button:has(h3)').first().click();
  164 | 
  165 |         // Customization drawer should open, click "Ajouter au Panier"
  166 |         console.log("Adding to cart...");
> 167 |         await page.waitForSelector('button:has-text("Ajouter au Panier")');
      |                    ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  168 |         await page.click('button:has-text("Ajouter au Panier")');
  169 | 
  170 |         // Click floating cart button to open checkout panel
  171 |         console.log("Opening cart checkout...");
  172 |         await page.waitForSelector('button:has(.lucide-shopping-bag)');
  173 |         await page.click('button:has(.lucide-shopping-bag)');
  174 | 
  175 |         // Wait for checkout drawer
  176 |         await page.waitForSelector('text=Panier & Commande');
  177 | 
  178 |         // Enter table location details
  179 |         console.log("Setting dine-in details...");
  180 |         await page.fill('input[placeholder*="N° de Table"]', '42');
  181 | 
  182 |         // Select Cash payment method explicitly
  183 |         console.log("Selecting Cash payment...");
  184 |         await page.locator('button:has-text("Sur Place")').last().click();
  185 | 
  186 |         // Check Direct Payment Terms Checkbox (make sure we click the last one inside cart sheet)
  187 |         await page.locator('input[type="checkbox"]').last().check();
  188 | 
  189 |         // Click Confirm order button
  190 |         console.log("Submitting order...");
  191 |         await page.click('button:has-text("Confirmer la commande")');
  192 | 
  193 |         // Verify Success dialog
  194 |         console.log("Verifying order success...");
  195 |         await page.waitForSelector('text=Commande Confirmée!');
  196 |         await page.click('button:has-text("Fermer")');
  197 |     });
  198 | 
  199 |     test('2. Hotel Room Booking Flow (Night + PayPal Payment)', async ({ page }) => {
  200 |         console.log("Starting Hotel Booking E2E...");
  201 |         await page.goto('/hotel');
  202 | 
  203 |         // Click standard room card
  204 |         console.log("Selecting standard room...");
  205 |         await page.waitForSelector('text=Chambre Standard');
  206 |         await page.locator('text=Chambre Standard').first().click();
  207 | 
  208 |         // Confirm night booking in floating pill footer
  209 |         console.log("Clicking book button...");
  210 |         await page.click('button:has-text("Réserver Nuitée")');
  211 | 
  212 |         // Secure payment modal should appear, pay with PayPal
  213 |         console.log("Paying with PayPal...");
  214 |         await page.waitForSelector('text=Paiement Sécurisé');
  215 |         await page.click('button:has-text("Pay with PayPal (Mock)")');
  216 | 
  217 |         // Success dialog check
  218 |         console.log("Verifying hotel booking success...");
  219 |         await page.waitForSelector('text=Réservation Reçue!');
  220 |         await page.click('button:has-text("Fermer")');
  221 |     });
  222 | 
  223 |     test('3. Pool Ticket Booking Flow (Full Day + PayPal Payment)', async ({ page }) => {
  224 |         console.log("Starting Pool Booking E2E...");
  225 |         await page.goto('/services/pool');
  226 | 
  227 |         // Select Mixed Category
  228 |         console.log("Selecting pool ambiance...");
  229 |         await page.waitForSelector('text=Mixte');
  230 |         await page.locator('text=Mixte').first().click();
  231 | 
  232 |         // Select Full Day Option
  233 |         console.log("Selecting pool formula...");
  234 |         await page.waitForSelector('text=Journée Complète');
  235 |         await page.locator('text=Journée Complète').first().click();
  236 | 
  237 |         // Click Book button in floating footer
  238 |         console.log("Clicking pool book button...");
  239 |         await page.click('button:has-text("Réserver Ticket")');
  240 | 
  241 |         // Secure payment modal should appear, pay with PayPal
  242 |         console.log("Paying with PayPal...");
  243 |         await page.waitForSelector('text=Paiement Sécurisé');
  244 |         await page.click('button:has-text("Pay with PayPal (Mock)")');
  245 | 
  246 |         // Success dialog check
  247 |         console.log("Verifying pool booking success...");
  248 |         await page.waitForSelector('text=Ticket Validé!');
  249 |         await page.click('button:has-text("Fermer")');
  250 |     });
  251 | });
  252 | 
```