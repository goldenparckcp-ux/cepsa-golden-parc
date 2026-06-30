# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: services-checkout.spec.ts >> Client Services Checkout E2E Flows >> 2. Hotel Room Booking Flow (Night + PayPal Payment)
- Location: tests\services-checkout.spec.ts:199:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Réserver Nuitée")')
    - locator resolved to <button disabled class="w-full bg-[#1e293b] flex-row-reverse rtl:flex-row border border-white/10 p-2 pl-3 rounded-[2rem] shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed hover:bg-[#253248]">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not enabled
    - retrying click action
      - waiting 100ms
    48 × waiting for element to be visible, enabled and stable
       - element is not enabled
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - button "Retour" [ref=e5] [cursor=pointer]:
      - img [ref=e6]
    - heading "Hôtel & Repos" [level=1] [ref=e8]
  - generic [ref=e9]:
    - generic [ref=e11]:
      - generic [ref=e12]:
        - img "Votre Séjour de Rêve"
        - generic [ref=e14]:
          - generic [ref=e15]:
            - generic [ref=e16]: 🏨 OFFRE SPÉCIALE
            - heading "Votre Séjour de Rêve" [level=2] [ref=e17]
            - paragraph [ref=e18]: Détente et confort absolu au cœur du Golden Park
          - button "Réserver" [ref=e20] [cursor=pointer]:
            - img [ref=e21]
            - generic [ref=e24]: Réserver
      - generic [ref=e25]:
        - img "Chambres Familiales"
        - generic [ref=e27]:
          - generic [ref=e28]:
            - generic [ref=e29]: 🏨 ESPACE FAMILLE
            - heading "Chambres Familiales" [level=2] [ref=e30]
            - paragraph [ref=e31]: Spacieuses, modernes et équipées pour toute la famille
          - button "Réserver" [ref=e33] [cursor=pointer]:
            - img [ref=e34]
            - generic [ref=e37]: Réserver
      - generic [ref=e38]:
        - img "Piscine & Détente"
        - generic [ref=e40]:
          - generic [ref=e41]:
            - generic [ref=e42]: 🏨 INCLUS DANS LE SÉJOUR
            - heading "Piscine & Détente" [level=2] [ref=e43]
            - paragraph [ref=e44]: Accès gratuit à la piscine pour tous nos résidents
          - button "Réserver" [ref=e46] [cursor=pointer]:
            - img [ref=e47]
            - generic [ref=e50]: Réserver
    - generic [ref=e55]:
      - generic [ref=e56]:
        - button "Nuitée" [ref=e58] [cursor=pointer]:
          - img [ref=e59]
          - generic [ref=e61]: Nuitée
        - button "Sieste (Jour)" [ref=e62] [cursor=pointer]:
          - img [ref=e63]
          - generic [ref=e69]: Sieste (Jour)
      - paragraph [ref=e70]: 🌙 Réservation complète pour la nuit
    - generic [ref=e71]:
      - heading "Choisir une Chambre" [level=3] [ref=e72]
      - generic [ref=e73]:
        - generic [ref=e74] [cursor=pointer]:
          - generic [ref=e75]:
            - img "Chambre Standard" [ref=e76]
            - generic [ref=e78]:
              - heading "Chambre Standard" [level=3] [ref=e79]
              - generic [ref=e80]:
                - text: 300 DH
                - generic [ref=e81]: /nuit
          - generic [ref=e83]:
            - generic [ref=e84]: Wifi Gratuit
            - generic [ref=e85]: TV HD
            - generic [ref=e86]: Douche Italienne
        - generic [ref=e87] [cursor=pointer]:
          - generic [ref=e88]:
            - img "Suite Deluxe" [ref=e89]
            - generic [ref=e91]:
              - heading "Suite Deluxe" [level=3] [ref=e92]
              - generic [ref=e93]:
                - text: 500 DH
                - generic [ref=e94]: /nuit
          - generic [ref=e96]:
            - generic [ref=e97]: Vue Panoramique
            - generic [ref=e98]: Mini Bar
            - generic [ref=e99]: Salon Privé
            - generic [ref=e100]: Baignoire
        - generic [ref=e101] [cursor=pointer]:
          - generic [ref=e102]:
            - img "Suite Familiale" [ref=e103]
            - generic [ref=e105]:
              - heading "Suite Familiale" [level=3] [ref=e106]
              - generic [ref=e107]:
                - text: 700 DH
                - generic [ref=e108]: /nuit
          - generic [ref=e110]:
            - generic [ref=e111]: 2 Lits Doubles
            - generic [ref=e112]: Espace Jeux
            - generic [ref=e113]: Kitchenette
            - generic [ref=e114]: Terrasse
    - generic [ref=e115]:
      - heading "Mode de Paiement" [level=3] [ref=e116]
      - generic [ref=e117]:
        - button "💵 Sur Place (Cash) Prix normal" [ref=e118] [cursor=pointer]:
          - generic [ref=e119]: 💵
          - generic [ref=e120]: Sur Place (Cash)
          - generic [ref=e121]: Prix normal
        - button "-10% 💳 En ligne (-10%) 10% de remise incluse" [ref=e122] [cursor=pointer]:
          - generic [ref=e123]: "-10%"
          - generic [ref=e124]: 💳
          - generic [ref=e125]: En ligne (-10%)
          - generic [ref=e126]: 10% de remise incluse
    - generic [ref=e128]:
      - generic [ref=e129]:
        - img [ref=e130]
        - heading "Dates de Séjour" [level=3] [ref=e132]
      - generic [ref=e133]:
        - generic [ref=e134]:
          - generic [ref=e135]: Date Départ
          - textbox "Date Départ" [ref=e136]: 2026-06-29
        - generic [ref=e137]:
          - generic [ref=e138]: Date Fin
          - textbox "Date Fin" [ref=e139]: 2026-06-30
  - button "0 hotel.book.dh ← Réserver Nuitée 1 Nuit(s) 1" [disabled] [ref=e142]:
    - generic [ref=e143]:
      - generic [ref=e144]: 0 hotel.book.dh
      - generic [ref=e145]: ←
    - generic [ref=e146]:
      - generic [ref=e147]:
        - generic [ref=e148]: Réserver Nuitée
        - generic [ref=e149]: 1 Nuit(s)
      - generic [ref=e150]: "1"
```

# Test source

```ts
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
  167 |         await page.waitForSelector('button:has-text("Ajouter au Panier")');
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
> 210 |         await page.click('button:has-text("Réserver Nuitée")');
      |                    ^ Error: page.click: Test timeout of 30000ms exceeded.
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