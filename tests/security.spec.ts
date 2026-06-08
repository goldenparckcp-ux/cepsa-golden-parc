import { test, expect } from '@playwright/test';

test.describe('Security & Role Redirection E2E Flows', () => {

    test.beforeEach(async ({ page }) => {
        // Set up console and error event listeners to help debug
        page.on('console', msg => console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

        // Mock Supabase to keep tests offline/stable
        await page.route('**/auth/v1/user', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    aud: "authenticated",
                    role: "authenticated",
                    email: "staff-test@example.com",
                    user_metadata: { full_name: "Staff Member" }
                })
            });
        });

        await page.route('**/rest/v1/**', async route => {
            const method = route.request().method();
            const url = route.request().url();
            
            if (url.includes('/rest/v1/profiles')) {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify([])
                });
                return;
            }
            if (url.includes('/rest/v1/staff')) {
                // Return no staff member from database so it relies on local PIN fallbacks
                await route.fulfill({
                    status: 404,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: "Not found" })
                });
                return;
            }
            // Catch-all for database calls in Dashboard / Panels
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([])
            });
        });
    });

    test('1. Unauthenticated users are blocked and routed appropriately', async ({ page }) => {
        // No session is set in localStorage

        // A. Visiting /admin should show the Admin portal login screen (PIN Pad)
        console.log("Checking /admin without auth...");
        await page.goto('/admin');
        await page.waitForSelector('text=Portail Staff Cepsa');
        await expect(page.locator('text=Saisissez votre code PIN pour accéder au panneau')).toBeVisible();

        // B. Visiting /staff/hotel should redirect to /staff page
        console.log("Checking /staff/hotel without auth...");
        await page.goto('/staff/hotel');
        await page.waitForURL('**/staff');
        await expect(page.locator('text=Portail Employés (Staff)')).toBeVisible();
        await expect(page.locator('text=Saisissez votre code PIN pour accéder à votre interface')).toBeVisible();

        // C. Visiting /staff/restaurant should redirect to /staff page
        console.log("Checking /staff/restaurant without auth...");
        await page.goto('/staff/restaurant');
        await page.waitForURL('**/staff');

        // D. Visiting /staff/pool-services should redirect to /staff page
        console.log("Checking /staff/pool-services without auth...");
        await page.goto('/staff/pool-services');
        await page.waitForURL('**/staff');
    });

    test('2. Staff roles are correctly isolated and locked out of unauthorized pages', async ({ page }) => {
        // A. Test Hotel Reception role (1111)
        console.log("Setting localStorage session to Hotel role...");
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem("staff_session", JSON.stringify({ role: "hotel", name: "Réception Hôtel" }));
        });

        // Visiting /admin should redirect them to their specific portal (/staff/hotel)
        console.log("Checking if hotel role is redirected from /admin...");
        await page.goto('/admin');
        await page.waitForURL('**/staff/hotel');
        await expect(page.locator('text=GOLDEN PARC • HÔTEL')).toBeVisible();

        // Visiting /staff/restaurant should redirect them to /staff login page
        console.log("Checking if hotel role is blocked from /staff/restaurant...");
        await page.goto('/staff/restaurant');
        await page.waitForURL('**/staff');

        // B. Test Kitchen/Chef role (2222)
        console.log("Setting localStorage session to Kitchen/Chef role...");
        await page.evaluate(() => {
            localStorage.setItem("staff_session", JSON.stringify({ role: "kitchen", name: "Chef Cuisine" }));
        });

        // Visiting /admin should redirect them to /staff/restaurant
        console.log("Checking if kitchen role is redirected from /admin...");
        await page.goto('/admin');
        await page.waitForURL('**/staff/restaurant');
        await expect(page.locator('text=GOLDEN PARC • CUISINE')).toBeVisible();

        // Visiting /staff/hotel should redirect them to /staff
        console.log("Checking if kitchen role is blocked from /staff/hotel...");
        await page.goto('/staff/hotel');
        await page.waitForURL('**/staff');

        // C. Test Pool/Services role (3333)
        console.log("Setting localStorage session to Pool/Services role...");
        await page.evaluate(() => {
            localStorage.setItem("staff_session", JSON.stringify({ role: "services", name: "Staff Piscine" }));
        });

        // Visiting /admin should redirect them to /staff/pool-services
        console.log("Checking if services role is redirected from /admin...");
        await page.goto('/admin');
        await page.waitForURL('**/staff/pool-services');
        await expect(page.locator('text=GOLDEN PARC • PISCINE')).toBeVisible();

        // Visiting /staff/hotel should redirect them to /staff
        console.log("Checking if services role is blocked from /staff/hotel...");
        await page.goto('/staff/hotel');
        await page.waitForURL('**/staff');
    });

    test('3. PIN Code Portal verification (Admin Portal /admin)', async ({ page }) => {
        await page.goto('/admin');
        await page.waitForSelector('text=Portail Staff Cepsa');

        // A. Enter incorrect PIN (e.g., 0000)
        console.log("Entering incorrect PIN in Admin portal...");
        for (const num of ['0', '0', '0', '0']) {
            await page.click(`button:has-text("${num}")`);
        }
        await page.waitForSelector('text=Code PIN incorrect ou réservé aux administrateurs.');

        // B. Enter Staff PIN (e.g., 1111)
        console.log("Entering Staff PIN in Admin portal...");
        for (const num of ['1', '1', '1', '1']) {
            await page.click(`button:has-text("${num}")`);
        }
        await page.waitForSelector("text=Accès Admin réservé. Veuillez utiliser le portail Staff (/staff) pour vous connecter.");

        // C. Enter Correct Admin PIN (7777)
        console.log("Entering Correct Admin PIN (7777)...");
        for (const num of ['7', '7', '7', '7']) {
            await page.click(`button:has-text("${num}")`);
        }
        // Should successfully log in and display Admin Dashboard
        await page.waitForSelector('text=Arrivées Hôtel Récentes');
        await expect(page.locator('text=Gestionnaires de Sécurité')).toBeVisible();
    });

    test('4. PIN Code Portal verification (Staff Portal /staff)', async ({ page }) => {
        await page.goto('/staff');
        await page.waitForSelector('text=Portail Employés (Staff)');

        // A. Enter incorrect PIN (e.g., 0000)
        console.log("Entering incorrect PIN in Staff portal...");
        for (const num of ['0', '0', '0', '0']) {
            await page.click(`button:has-text("${num}")`);
        }
        await page.waitForSelector("text=Code PIN incorrect. Veuillez contacter l'administrateur.");

        // B. Enter Admin PIN (7777)
        console.log("Entering Admin PIN in Staff portal...");
        for (const num of ['7', '7', '7', '7']) {
            await page.click(`button:has-text("${num}")`);
        }
        await page.waitForSelector("text=Ce code PIN est réservé à l'administrateur. Veuillez utiliser le portail Admin (/admin).");

        // C. Enter Hotel PIN (1111) -> Redirects to hotel portal
        console.log("Entering Hotel PIN in Staff portal...");
        for (const num of ['1', '1', '1', '1']) {
            await page.click(`button:has-text("${num}")`);
        }
        await page.waitForURL('**/staff/hotel');
        await expect(page.locator('text=GOLDEN PARC • HÔTEL')).toBeVisible();
    });
});
