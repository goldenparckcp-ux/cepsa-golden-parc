# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: security.spec.ts >> Security & Role Redirection E2E Flows >> 3. PIN Code Portal verification (Admin Portal /admin)
- Location: tests\security.spec.ts:136:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Code PIN incorrect ou réservé aux administrateurs.') to be visible

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - img [ref=e5]
  - heading "Portail Staff Golden Parc" [level=2] [ref=e8]
  - paragraph [ref=e9]: Saisissez votre code PIN pour accéder au panneau
  - generic [ref=e15]:
    - button "1" [ref=e16] [cursor=pointer]
    - button "2" [ref=e17] [cursor=pointer]
    - button "3" [ref=e18] [cursor=pointer]
    - button "4" [ref=e19] [cursor=pointer]
    - button "5" [ref=e20] [cursor=pointer]
    - button "6" [ref=e21] [cursor=pointer]
    - button "7" [ref=e22] [cursor=pointer]
    - button "8" [ref=e23] [cursor=pointer]
    - button "9" [ref=e24] [cursor=pointer]
    - button "EFFACER" [ref=e25] [cursor=pointer]
    - button "0" [active] [ref=e26] [cursor=pointer]
    - button "RETOUR" [ref=e27] [cursor=pointer]
  - generic [ref=e30]: Sécurisé
```

# Test source

```ts
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
  67  |         await page.waitForURL('**/staff');
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
> 145 |         await page.waitForSelector('text=Code PIN incorrect ou réservé aux administrateurs.');
      |                    ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
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
  168 |         // A. Enter incorrect PIN (e.g., 0000)
  169 |         console.log("Entering incorrect PIN in Staff portal...");
  170 |         for (const num of ['0', '0', '0', '0']) {
  171 |             await page.click(`button:has-text("${num}")`);
  172 |         }
  173 |         await page.waitForSelector("text=Code PIN incorrect. Veuillez contacter l'administrateur.");
  174 | 
  175 |         // B. Enter Admin PIN (7777)
  176 |         console.log("Entering Admin PIN in Staff portal...");
  177 |         for (const num of ['7', '7', '7', '7']) {
  178 |             await page.click(`button:has-text("${num}")`);
  179 |         }
  180 |         await page.waitForSelector("text=Ce code PIN est réservé à l'administrateur. Veuillez utiliser le portail Admin (/admin).");
  181 | 
  182 |         // C. Enter Hotel PIN (1111) -> Redirects to hotel portal
  183 |         console.log("Entering Hotel PIN in Staff portal...");
  184 |         for (const num of ['1', '1', '1', '1']) {
  185 |             await page.click(`button:has-text("${num}")`);
  186 |         }
  187 |         await page.waitForURL('**/staff/hotel');
  188 |         await expect(page.locator('text=GOLDEN PARC • HÔTEL')).toBeVisible();
  189 |     });
  190 | });
  191 | 
```