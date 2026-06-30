# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: menu-manager.spec.ts >> Visual Menu Manager E2E Flow (Add, Verify Client, Edit Price, Verify Client, Delete Cleanup)
- Location: tests\menu-manager.spec.ts:12:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForSelector: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('text=Grille Restaurant (Visual Menu Editor)') to be visible

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
    - button "0" [ref=e26] [cursor=pointer]
    - button "RETOUR" [ref=e27] [cursor=pointer]
  - generic [ref=e30]: Sécurisé
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.beforeEach(async ({ page }) => {
  4   |     // Navigate to page first to set the origin context
  5   |     await page.goto('/');
  6   |     // Set staff admin session in localStorage to bypass redirection
  7   |     await page.evaluate(() => {
  8   |         localStorage.setItem("staff_session", JSON.stringify({ role: "admin", name: "Directeur" }));
  9   |     });
  10  | });
  11  | 
  12  | test('Visual Menu Manager E2E Flow (Add, Verify Client, Edit Price, Verify Client, Delete Cleanup)', async ({ page }) => {
  13  |     // 1. Navigate to Admin Prices Page
  14  |     console.log("Navigating to Admin Prices...");
  15  |     await page.goto('/admin/prices');
  16  | 
  17  |     // Wait for the UI loading state to complete
> 18  |     await page.waitForSelector('text=Grille Restaurant (Visual Menu Editor)');
      |                ^ Error: page.waitForSelector: Test timeout of 30000ms exceeded.
  19  | 
  20  |     // 2. Open Add Plat Drawer
  21  |     console.log("Opening Add Item Drawer...");
  22  |     await page.click('button:has-text("Ajouter Plat")');
  23  |     await page.waitForSelector('text=Ajouter le plat au Restaurant');
  24  | 
  25  |     // 3. Fill out the form fields
  26  |     const uniqueName = `Plat Playwright E2E ${Date.now()}`;
  27  |     console.log(`Filling form for: ${uniqueName}`);
  28  |     await page.fill('#name_fr', uniqueName);
  29  |     await page.fill('#base_price', '99');
  30  |     await page.fill('#description_fr', 'Plat de test cree automatiquement par les tests Playwright.');
  31  |     
  32  |     // Choose image template
  33  |     await page.click('button:has-text("Pizza")');
  34  | 
  35  |     // 4. Submit the form
  36  |     console.log("Submitting form...");
  37  |     await page.click('button[type="submit"]');
  38  | 
  39  |     // 5. Verify the item was added in Admin Panel
  40  |     console.log("Verifying addition in Admin...");
  41  |     await page.waitForSelector(`text=${uniqueName}`);
  42  | 
  43  |     // Verify its price input value
  44  |     const adminItemContainer = page.locator(`div.group`, { has: page.locator(`h4:has-text("${uniqueName}")`) }).first();
  45  |     const adminPriceInput = adminItemContainer.locator('input[type="number"]');
  46  |     await expect(adminPriceInput).toHaveValue('99');
  47  | 
  48  |     // 6. Verify on Client side
  49  |     console.log("Navigating to Restaurant Client View...");
  50  |     await page.goto('/restaurant');
  51  |     
  52  |     // Select "Tout" category just to refresh and show all items
  53  |     await page.click('button:has-text("Tout")');
  54  |     await page.waitForSelector(`text=${uniqueName}`);
  55  |     
  56  |     // Assert item price is displayed on client page
  57  |     const clientItemContainer = page.locator(`button:has(h3:has-text("${uniqueName}"))`);
  58  |     await expect(clientItemContainer.locator('text=99.00 DH')).toBeVisible();
  59  | 
  60  |     // 7. Go back to Admin Prices and modify the price to 88 DH
  61  |     console.log("Modifying price to 88 DH f Admin...");
  62  |     await page.goto('/admin/prices');
  63  |     await page.waitForSelector(`text=${uniqueName}`);
  64  |     
  65  |     // Locate the specific price input and change it
  66  |     // Using has() filter for absolute accuracy
  67  |     const itemContainer = page.locator(`div.group`, { has: page.locator(`h4:has-text("${uniqueName}")`) }).first();
  68  |     const priceInput = itemContainer.locator('input[type="number"]');
  69  |     
  70  |     await priceInput.fill('88');
  71  |     await priceInput.blur(); // triggers save
  72  | 
  73  |     // Wait for green success popup
  74  |     await page.waitForSelector('text=Prix du plat mis à jour avec succès !');
  75  | 
  76  |     // 8. Verify the updated price on Client side
  77  |     console.log("Verifying modified price on Client View...");
  78  |     await page.goto('/restaurant');
  79  |     await page.click('button:has-text("Tout")');
  80  |     await page.waitForSelector(`text=${uniqueName}`);
  81  |     
  82  |     const updatedClientItem = page.locator(`button:has(h3:has-text("${uniqueName}"))`);
  83  |     await expect(updatedClientItem.locator('text=88.00 DH')).toBeVisible();
  84  | 
  85  |     // 9. Cleanup - Delete the test plate from the menu
  86  |     console.log("Deleting test item to clean up database...");
  87  |     await page.goto('/admin/prices');
  88  |     await page.waitForSelector(`text=${uniqueName}`);
  89  | 
  90  |     // Set up dialog handler to confirm deletion
  91  |     page.on('dialog', async dialog => {
  92  |         expect(dialog.message()).toContain('Voulez-vous vraiment supprimer');
  93  |         await dialog.accept();
  94  |     });
  95  | 
  96  |     const targetDeleteBtn = page.locator(`div.group`, { has: page.locator(`h4:has-text("${uniqueName}")`) }).first().locator('button[title="Supprimer du menu"]');
  97  |     await targetDeleteBtn.click();
  98  | 
  99  |     // Verify it is gone from Admin view
  100 |     await page.waitForTimeout(1000); // Wait briefly for state update
  101 |     await expect(page.locator(`div.group`, { has: page.locator(`h4:has-text("${uniqueName}")`) }).first()).not.toBeVisible();
  102 |     console.log("E2E Test Flow completed successfully and cleaned up!");
  103 | });
  104 | 
```