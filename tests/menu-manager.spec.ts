import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
    // Navigate to page first to set the origin context
    await page.goto('/');
    // Set staff admin session in localStorage to bypass redirection
    await page.evaluate(() => {
        localStorage.setItem("staff_session", JSON.stringify({ role: "admin", name: "Directeur" }));
    });
});

test('Visual Menu Manager E2E Flow (Add, Verify Client, Edit Price, Verify Client, Delete Cleanup)', async ({ page }) => {
    // 1. Navigate to Admin Prices Page
    console.log("Navigating to Admin Prices...");
    await page.goto('/admin/prices');

    // Wait for the UI loading state to complete
    await page.waitForSelector('text=Grille Restaurant (Visual Menu Editor)');

    // 2. Open Add Plat Drawer
    console.log("Opening Add Item Drawer...");
    await page.click('button:has-text("Ajouter Plat")');
    await page.waitForSelector('text=Ajouter le plat au Restaurant');

    // 3. Fill out the form fields
    const uniqueName = `Plat Playwright E2E ${Date.now()}`;
    console.log(`Filling form for: ${uniqueName}`);
    await page.fill('#name_fr', uniqueName);
    await page.fill('#base_price', '99');
    await page.fill('#description_fr', 'Plat de test cree automatiquement par les tests Playwright.');
    
    // Choose image template
    await page.click('button:has-text("Pizza")');

    // 4. Submit the form
    console.log("Submitting form...");
    await page.click('button[type="submit"]');

    // 5. Verify the item was added in Admin Panel
    console.log("Verifying addition in Admin...");
    await page.waitForSelector(`text=${uniqueName}`);

    // Verify its price input value
    const adminItemContainer = page.locator(`div.group`, { has: page.locator(`h4:has-text("${uniqueName}")`) }).first();
    const adminPriceInput = adminItemContainer.locator('input[type="number"]');
    await expect(adminPriceInput).toHaveValue('99');

    // 6. Verify on Client side
    console.log("Navigating to Restaurant Client View...");
    await page.goto('/restaurant');
    
    // Select "Tout" category just to refresh and show all items
    await page.click('button:has-text("Tout")');
    await page.waitForSelector(`text=${uniqueName}`);
    
    // Assert item price is displayed on client page
    const clientItemContainer = page.locator(`button:has(h3:has-text("${uniqueName}"))`);
    await expect(clientItemContainer.locator('text=99.00 DH')).toBeVisible();

    // 7. Go back to Admin Prices and modify the price to 88 DH
    console.log("Modifying price to 88 DH f Admin...");
    await page.goto('/admin/prices');
    await page.waitForSelector(`text=${uniqueName}`);
    
    // Locate the specific price input and change it
    // Using has() filter for absolute accuracy
    const itemContainer = page.locator(`div.group`, { has: page.locator(`h4:has-text("${uniqueName}")`) }).first();
    const priceInput = itemContainer.locator('input[type="number"]');
    
    await priceInput.fill('88');
    await priceInput.blur(); // triggers save

    // Wait for green success popup
    await page.waitForSelector('text=Prix du plat mis à jour avec succès !');

    // 8. Verify the updated price on Client side
    console.log("Verifying modified price on Client View...");
    await page.goto('/restaurant');
    await page.click('button:has-text("Tout")');
    await page.waitForSelector(`text=${uniqueName}`);
    
    const updatedClientItem = page.locator(`button:has(h3:has-text("${uniqueName}"))`);
    await expect(updatedClientItem.locator('text=88.00 DH')).toBeVisible();

    // 9. Cleanup - Delete the test plate from the menu
    console.log("Deleting test item to clean up database...");
    await page.goto('/admin/prices');
    await page.waitForSelector(`text=${uniqueName}`);

    // Set up dialog handler to confirm deletion
    page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Voulez-vous vraiment supprimer');
        await dialog.accept();
    });

    const targetDeleteBtn = page.locator(`div.group`, { has: page.locator(`h4:has-text("${uniqueName}")`) }).first().locator('button[title="Supprimer du menu"]');
    await targetDeleteBtn.click();

    // Verify it is gone from Admin view
    await page.waitForTimeout(1000); // Wait briefly for state update
    await expect(page.locator(`div.group`, { has: page.locator(`h4:has-text("${uniqueName}")`) }).first()).not.toBeVisible();
    console.log("E2E Test Flow completed successfully and cleaned up!");
});
