# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: services-checkout.spec.ts >> Client Services Checkout E2E Flows >> 3. Pool Ticket Booking Flow (Full Day + PayPal Payment)
- Location: tests\services-checkout.spec.ts:223:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Réserver Ticket")')
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
    46 × waiting for element to be visible, enabled and stable
       - element is not enabled
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - button "Retour" [ref=e5] [cursor=pointer]:
      - img [ref=e6]
    - heading "Piscine & Détente" [level=1] [ref=e8]
  - generic [ref=e9]:
    - generic [ref=e11]:
      - generic [ref=e12]:
        - img "Pool Access"
        - generic [ref=e15]:
          - generic [ref=e16]: 💦 SUMMER VIBES
          - heading "Pool Access" [level=2] [ref=e17]
          - paragraph [ref=e18]: Espace aquatique de détente et fraîcheur au Golden Park
      - generic [ref=e19]:
        - img "Journée Femmes"
        - generic [ref=e22]:
          - generic [ref=e23]: 💦 100% SÉCURISÉ & PRIVÉ
          - heading "Journée Femmes" [level=2] [ref=e24]
          - paragraph [ref=e25]: Profitez d'une intimité et d'une ambiance exclusive chaque mercredi & vendredi
      - generic [ref=e26]:
        - img "Espace Familles"
        - generic [ref=e29]:
          - generic [ref=e30]: 💦 ESPACE CHALEUREUX
          - heading "Espace Familles" [level=2] [ref=e31]
          - paragraph [ref=e32]: Partagez des moments exceptionnels en famille au bord de l'eau
    - generic [ref=e37]:
      - heading "Ambiance" [level=3] [ref=e38]
      - generic [ref=e39]:
        - button "👨‍👩‍👧‍👦 Famille 📅 LUNDI" [ref=e40] [cursor=pointer]:
          - generic [ref=e41]: 👨‍👩‍👧‍👦
          - generic [ref=e42]: Famille
          - generic [ref=e43]: 📅 LUNDI
        - button "👫 Mixte ✨ AUTRES JOURS" [ref=e44] [cursor=pointer]:
          - generic [ref=e45]: 👫
          - generic [ref=e46]: Mixte
          - generic [ref=e47]: ✨ AUTRES JOURS
          - img [ref=e48]
        - button "💃 Femmes 📅 JEUDI" [ref=e51] [cursor=pointer]:
          - generic [ref=e52]: 💃
          - generic [ref=e53]: Femmes
          - generic [ref=e54]: 📅 JEUDI
    - generic [ref=e55]:
      - heading "Formule & Horaire" [level=3] [ref=e56]
      - generic [ref=e57]:
        - 'button "Matinée 09:00 - 13:00 Adulte: 50 DH Enfant: 25 DH" [ref=e58] [cursor=pointer]':
          - generic [ref=e59]:
            - generic [ref=e61]:
              - img [ref=e62]
              - generic [ref=e68]: Matinée
            - generic [ref=e69]: 09:00 - 13:00
            - generic [ref=e70]:
              - generic [ref=e71]: "Adulte: 50 DH"
              - generic [ref=e72]: "Enfant: 25 DH"
        - 'button "Après-Midi 14:00 - 19:00 Adulte: 50 DH Enfant: 25 DH" [ref=e73] [cursor=pointer]':
          - generic [ref=e74]:
            - generic [ref=e76]:
              - img [ref=e77]
              - generic [ref=e83]: Après-Midi
            - generic [ref=e84]: 14:00 - 19:00
            - generic [ref=e85]:
              - generic [ref=e86]: "Adulte: 50 DH"
              - generic [ref=e87]: "Enfant: 25 DH"
        - 'button "Journée Complète 09:00 - 19:00 Adulte: 90 DH Enfant: 40 DH" [active] [ref=e88] [cursor=pointer]':
          - generic [ref=e89]:
            - generic [ref=e91]:
              - img [ref=e92]
              - generic [ref=e94]: Journée Complète
            - generic [ref=e95]: 09:00 - 19:00
            - generic [ref=e96]:
              - generic [ref=e97]: "Adulte: 90 DH"
              - generic [ref=e98]: "Enfant: 40 DH"
    - generic [ref=e99]:
      - heading "Mode de Paiement" [level=3] [ref=e100]
      - generic [ref=e101]:
        - button "💵 Sur Place (Cash) Prix normal" [ref=e102] [cursor=pointer]:
          - generic [ref=e103]: 💵
          - generic [ref=e104]: Sur Place (Cash)
          - generic [ref=e105]: Prix normal
        - button "-10% 💳 En ligne (-10%) 10% de remise incluse" [ref=e106] [cursor=pointer]:
          - generic [ref=e107]: "-10%"
          - generic [ref=e108]: 💳
          - generic [ref=e109]: En ligne (-10%)
          - generic [ref=e110]: 10% de remise incluse
    - generic [ref=e113]:
      - generic [ref=e114]:
        - generic [ref=e115]: Date
        - textbox "Date de réservation" [ref=e116]: 2026-06-29
      - generic [ref=e117]:
        - generic [ref=e118]:
          - img [ref=e119]
          - text: Adultes (-- DH)
        - generic [ref=e124]:
          - button "+" [ref=e125] [cursor=pointer]
          - generic [ref=e126]: "1"
          - button "-" [ref=e127] [cursor=pointer]
      - generic [ref=e128]:
        - generic [ref=e129]:
          - img [ref=e130]
          - text: Enfants (-- DH)
        - generic [ref=e133]:
          - button "+" [ref=e134] [cursor=pointer]
          - generic [ref=e135]: "0"
          - button "-" [ref=e136] [cursor=pointer]
  - button "0 DH ← Réserver Ticket Choisir créneau 1" [disabled] [ref=e139]:
    - generic [ref=e140]:
      - generic [ref=e141]: 0 DH
      - generic [ref=e142]: ←
    - generic [ref=e143]:
      - generic [ref=e144]:
        - generic [ref=e145]: Réserver Ticket
        - generic [ref=e146]: Choisir créneau
      - generic [ref=e147]: "1"
```

# Test source

```ts
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
> 239 |         await page.click('button:has-text("Réserver Ticket")');
      |                    ^ Error: page.click: Test timeout of 30000ms exceeded.
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