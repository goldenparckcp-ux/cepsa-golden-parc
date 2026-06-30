# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security.spec.ts >> Security & Role Redirection E2E Flows >> 1. Unauthenticated users are blocked and routed appropriately
- Location: tests\security.spec.ts:55:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/staff" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - generic [ref=e8]:
        - heading "GOLDEN PARC • HÔTEL 🏨" [level=1] [ref=e9]
        - generic [ref=e10]: Espace Réception & Chambres
    - button "Se Déconnecter" [ref=e11] [cursor=pointer]:
      - img [ref=e12]
      - text: Se Déconnecter
  - main [ref=e15]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - heading "Gestion de l'Hôtel" [level=2] [ref=e18]
        - paragraph [ref=e19]: Suivi des séjours et attribution des chambres en direct
      - button "Actualiser" [ref=e20] [cursor=pointer]:
        - img [ref=e21]
        - text: Actualiser
    - generic [ref=e26]:
      - heading "Chambres physiques & État d'occupation" [level=3] [ref=e27]: Chambres physiques & État d'occupation
      - generic [ref=e29]:
        - generic [ref=e30]:
          - generic [ref=e32]:
            - generic [ref=e33]: "101"
            - generic [ref=e34]: standard
          - generic [ref=e35]: ● Disponible
        - generic [ref=e36]:
          - generic [ref=e38]:
            - generic [ref=e39]: "102"
            - generic [ref=e40]: standard
          - generic [ref=e41]: ● Disponible
        - generic [ref=e42]:
          - generic [ref=e44]:
            - generic [ref=e45]: "103"
            - generic [ref=e46]: deluxe
          - generic [ref=e47]: ● Disponible
        - generic [ref=e48]:
          - generic [ref=e50]:
            - generic [ref=e51]: "104"
            - generic [ref=e52]: deluxe
          - generic [ref=e53]: ● Disponible
        - generic [ref=e54]:
          - generic [ref=e56]:
            - generic [ref=e57]: "105"
            - generic [ref=e58]: family
          - generic [ref=e59]: ● Disponible
    - generic [ref=e60]:
      - generic [ref=e61]:
        - img [ref=e62]
        - textbox "N° réservation, téléphone, type..." [ref=e65]
      - generic [ref=e66]:
        - button "Arrivées (Attente)" [ref=e67] [cursor=pointer]:
          - generic [ref=e68]: Arrivées (Attente)
        - button "Sur Place (Actifs)" [ref=e69] [cursor=pointer]:
          - generic [ref=e70]: Sur Place (Actifs)
        - button "Historique" [ref=e71] [cursor=pointer]:
          - generic [ref=e72]: Historique
    - generic [ref=e73]:
      - img [ref=e74]
      - heading "Aucune réservation" [level=3] [ref=e76]
      - paragraph [ref=e77]: Aucun dossier dans cette catégorie.
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Security & Role Redirection E2E Flows', () => {
  4   | 
  5   |     test.beforeEach(async ({ page }) => {
  6   |         // Set up console and error event listeners to help debug
  7   |         page.on('console', msg => console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`));
  8   |         page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));
  9   | 
  10  |         // Mock Supabase to keep tests offline/stable
  11  |         await page.route('**/auth/v1/user', async route => {
  12  |             await route.fulfill({
  13  |                 status: 200,
  14  |                 contentType: 'application/json',
  15  |                 body: JSON.stringify({
  16  |                     id: "550e8400-e29b-41d4-a716-446655440000",
  17  |                     aud: "authenticated",
  18  |                     role: "authenticated",
  19  |                     email: "staff-test@example.com",
  20  |                     user_metadata: { full_name: "Staff Member" }
  21  |                 })
  22  |             });
  23  |         });
  24  | 
  25  |         await page.route('**/rest/v1/**', async route => {
  26  |             const method = route.request().method();
  27  |             const url = route.request().url();
  28  |             
  29  |             if (url.includes('/rest/v1/profiles')) {
  30  |                 await route.fulfill({
  31  |                     status: 200,
  32  |                     contentType: 'application/json',
  33  |                     body: JSON.stringify([])
  34  |                 });
  35  |                 return;
  36  |             }
  37  |             if (url.includes('/rest/v1/staff')) {
  38  |                 // Return no staff member from database so it relies on local PIN fallbacks
  39  |                 await route.fulfill({
  40  |                     status: 404,
  41  |                     contentType: 'application/json',
  42  |                     body: JSON.stringify({ error: "Not found" })
  43  |                 });
  44  |                 return;
  45  |             }
  46  |             // Catch-all for database calls in Dashboard / Panels
  47  |             await route.fulfill({
  48  |                 status: 200,
  49  |                 contentType: 'application/json',
  50  |                 body: JSON.stringify([])
  51  |             });
  52  |         });
  53  |     });
  54  | 
  55  |     test('1. Unauthenticated users are blocked and routed appropriately', async ({ page }) => {
  56  |         // No session is set in localStorage
  57  | 
  58  |         // A. Visiting /admin should show the Admin portal login screen (PIN Pad)
  59  |         console.log("Checking /admin without auth...");
  60  |         await page.goto('/admin');
  61  |         await page.waitForSelector('text=Portail Staff Golden Parc');
  62  |         await expect(page.locator('text=Saisissez votre code PIN pour accéder au panneau')).toBeVisible();
  63  | 
  64  |         // B. Visiting /staff/hotel should redirect to /staff page
  65  |         console.log("Checking /staff/hotel without auth...");
  66  |         await page.goto('/staff/hotel');
> 67  |         await page.waitForURL('**/staff');
      |                    ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  68  |         await expect(page.locator('text=Portail Employés (Staff)')).toBeVisible();
  69  |         await expect(page.locator('text=Saisissez votre code PIN pour accéder à votre interface')).toBeVisible();
  70  | 
  71  |         // C. Visiting /staff/restaurant should redirect to /staff page
  72  |         console.log("Checking /staff/restaurant without auth...");
  73  |         await page.goto('/staff/restaurant');
  74  |         await page.waitForURL('**/staff');
  75  | 
  76  |         // D. Visiting /staff/pool-services should redirect to /staff page
  77  |         console.log("Checking /staff/pool-services without auth...");
  78  |         await page.goto('/staff/pool-services');
  79  |         await page.waitForURL('**/staff');
  80  |     });
  81  | 
  82  |     test('2. Staff roles are correctly isolated and locked out of unauthorized pages', async ({ page }) => {
  83  |         // A. Test Hotel Reception role (1111)
  84  |         console.log("Setting localStorage session to Hotel role...");
  85  |         await page.goto('/');
  86  |         await page.evaluate(() => {
  87  |             localStorage.setItem("staff_session", JSON.stringify({ role: "hotel", name: "Réception Hôtel" }));
  88  |         });
  89  | 
  90  |         // Visiting /admin should redirect them to their specific portal (/staff/hotel)
  91  |         console.log("Checking if hotel role is redirected from /admin...");
  92  |         await page.goto('/admin');
  93  |         await page.waitForURL('**/staff/hotel');
  94  |         await expect(page.locator('text=GOLDEN PARC • HÔTEL')).toBeVisible();
  95  | 
  96  |         // Visiting /staff/restaurant should redirect them to /staff login page
  97  |         console.log("Checking if hotel role is blocked from /staff/restaurant...");
  98  |         await page.goto('/staff/restaurant');
  99  |         await page.waitForURL('**/staff');
  100 | 
  101 |         // B. Test Kitchen/Chef role (2222)
  102 |         console.log("Setting localStorage session to Kitchen/Chef role...");
  103 |         await page.evaluate(() => {
  104 |             localStorage.setItem("staff_session", JSON.stringify({ role: "kitchen", name: "Chef Cuisine" }));
  105 |         });
  106 | 
  107 |         // Visiting /admin should redirect them to /staff/restaurant
  108 |         console.log("Checking if kitchen role is redirected from /admin...");
  109 |         await page.goto('/admin');
  110 |         await page.waitForURL('**/staff/restaurant');
  111 |         await expect(page.locator('text=GOLDEN PARC • CUISINE')).toBeVisible();
  112 | 
  113 |         // Visiting /staff/hotel should redirect them to /staff
  114 |         console.log("Checking if kitchen role is blocked from /staff/hotel...");
  115 |         await page.goto('/staff/hotel');
  116 |         await page.waitForURL('**/staff');
  117 | 
  118 |         // C. Test Pool/Services role (3333)
  119 |         console.log("Setting localStorage session to Pool/Services role...");
  120 |         await page.evaluate(() => {
  121 |             localStorage.setItem("staff_session", JSON.stringify({ role: "services", name: "Staff Piscine" }));
  122 |         });
  123 | 
  124 |         // Visiting /admin should redirect them to /staff/pool-services
  125 |         console.log("Checking if services role is redirected from /admin...");
  126 |         await page.goto('/admin');
  127 |         await page.waitForURL('**/staff/pool-services');
  128 |         await expect(page.locator('text=GOLDEN PARC • PISCINE')).toBeVisible();
  129 | 
  130 |         // Visiting /staff/hotel should redirect them to /staff
  131 |         console.log("Checking if services role is blocked from /staff/hotel...");
  132 |         await page.goto('/staff/hotel');
  133 |         await page.waitForURL('**/staff');
  134 |     });
  135 | 
  136 |     test('3. PIN Code Portal verification (Admin Portal /admin)', async ({ page }) => {
  137 |         await page.goto('/admin');
  138 |         await page.waitForSelector('text=Portail Staff Golden Parc');
  139 | 
  140 |         // A. Enter incorrect PIN (e.g., 0000)
  141 |         console.log("Entering incorrect PIN in Admin portal...");
  142 |         for (const num of ['0', '0', '0', '0']) {
  143 |             await page.click(`button:has-text("${num}")`);
  144 |         }
  145 |         await page.waitForSelector('text=Code PIN incorrect ou réservé aux administrateurs.');
  146 | 
  147 |         // B. Enter Staff PIN (e.g., 1111)
  148 |         console.log("Entering Staff PIN in Admin portal...");
  149 |         for (const num of ['1', '1', '1', '1']) {
  150 |             await page.click(`button:has-text("${num}")`);
  151 |         }
  152 |         await page.waitForSelector("text=Accès Admin réservé. Veuillez utiliser le portail Staff (/staff) pour vous connecter.");
  153 | 
  154 |         // C. Enter Correct Admin PIN (7777)
  155 |         console.log("Entering Correct Admin PIN (7777)...");
  156 |         for (const num of ['7', '7', '7', '7']) {
  157 |             await page.click(`button:has-text("${num}")`);
  158 |         }
  159 |         // Should successfully log in and display Admin Dashboard
  160 |         await page.waitForSelector('text=Arrivées Hôtel Récentes');
  161 |         await expect(page.locator('text=Gestionnaires de Sécurité')).toBeVisible();
  162 |     });
  163 | 
  164 |     test('4. PIN Code Portal verification (Staff Portal /staff)', async ({ page }) => {
  165 |         await page.goto('/staff');
  166 |         await page.waitForSelector('text=Portail Employés (Staff)');
  167 | 
```