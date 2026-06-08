import { test, expect } from '@playwright/test';

test.describe('Client Services Checkout E2E Flows', () => {

    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`));
        page.on('pageerror', err => console.log(`BROWSER ERROR: ${err.message}`));

        // Mock Supabase Auth network call
        await page.route('**/auth/v1/user', async route => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    aud: "authenticated",
                    role: "authenticated",
                    email: "customer-test@example.com",
                    phone: "+212600000000",
                    user_metadata: {
                        full_name: "Utilisateur E2E Test",
                        phone: "+212600000000"
                    },
                    created_at: new Date().toISOString()
                })
            });
        });

        // Generic mock for all public Supabase PostgREST endpoints
        await page.route('**/rest/v1/**', async (route) => {
            const method = route.request().method();
            const url = route.request().url();
            console.log(`Intercepted Rest API [${method}]: ${url}`);
            
            if (method === 'GET') {
                if (url.includes('/rest/v1/profiles')) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify({
                            id: "550e8400-e29b-41d4-a716-446655440000",
                            full_name: "Utilisateur E2E Test",
                            phone: "0600000000",
                            email: "customer-test@example.com",
                            wallet_balance: 150
                        })
                    });
                    return;
                }
                if (url.includes('/rest/v1/service_bookings') ||
                    url.includes('/rest/v1/hotel_reservations') ||
                    url.includes('/rest/v1/pool_bookings') ||
                    url.includes('/rest/v1/restaurant_orders')) {
                    await route.fulfill({
                        status: 200,
                        contentType: 'application/json',
                        body: JSON.stringify([])
                    });
                    return;
                }
                // Pass through other GETs
                await route.continue();
                return;
            }

            // For POST/PATCH writes, return mock success data
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: "mock-id-12345",
                    booking_number: "BOOK-E2E-123456",
                    order_number: "CMD-E2E-123456",
                    total_price: 90,
                    status: "pending",
                    deposit_paid: true
                })
            });
        });

        // Pre-set the client Supabase session in localStorage
        await page.goto('/');
        await page.evaluate(() => {
            const mockSession = {
                access_token: "mock-jwt-token",
                token_type: "bearer",
                expires_in: 3600,
                refresh_token: "mock-refresh-token",
                user: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    aud: "authenticated",
                    role: "authenticated",
                    email: "customer-test@example.com",
                    phone: "+212600000000",
                    user_metadata: {
                        full_name: "Utilisateur E2E Test",
                        phone: "+212600000000"
                    }
                },
                expires_at: Math.floor(Date.now() / 1000) + 3600
            };
            localStorage.setItem("sb-vktqecgylkjogquhsymz-auth-token", JSON.stringify(mockSession));
            localStorage.setItem("app_lang", "fr"); // Force French
        });
    });

    test('1. Restaurant Ordering Flow', async ({ page }) => {
        console.log("Starting Restaurant Ordering E2E...");
        await page.goto('/restaurant');

        // Click first available dish card
        console.log("Selecting menu item...");
        await page.waitForSelector('button:has(h3)');
        await page.locator('button:has(h3)').first().click();

        // Customization drawer should open, click "Ajouter au Panier"
        console.log("Adding to cart...");
        await page.waitForSelector('button:has-text("Ajouter au Panier")');
        await page.click('button:has-text("Ajouter au Panier")');

        // Click floating cart button to open checkout panel
        console.log("Opening cart checkout...");
        await page.waitForSelector('button:has(.lucide-shopping-bag)');
        await page.click('button:has(.lucide-shopping-bag)');

        // Wait for checkout drawer
        await page.waitForSelector('text=Panier & Commande');

        // Enter table location details
        console.log("Setting dine-in details...");
        await page.fill('input[placeholder*="N° de Table"]', '42');

        // Check Direct Payment Terms Checkbox (make sure we click the last one inside cart sheet)
        await page.locator('input[type="checkbox"]').last().check();

        // Click Confirm order button
        console.log("Submitting order...");
        await page.click('button:has-text("Confirmer la commande")');

        // Verify Success dialog
        console.log("Verifying order success...");
        await page.waitForSelector('text=Commande Confirmée!');
        await page.click('button:has-text("Fermer")');
    });

    test('2. Hotel Room Booking Flow (Night + Wallet Payment)', async ({ page }) => {
        console.log("Starting Hotel Booking E2E...");
        await page.goto('/hotel');

        // Click standard room card
        console.log("Selecting standard room...");
        await page.waitForSelector('text=Chambre Standard');
        await page.locator('text=Chambre Standard').first().click();

        // Confirm night booking in floating pill footer
        console.log("Clicking book button...");
        await page.click('button:has-text("Réserver Nuitée")');

        // Secure payment modal should appear, choose wallet
        console.log("Paying with wallet...");
        await page.waitForSelector('text=Paiement Sécurisé');
        await page.click('text=Golden Wallet');
        await page.click('button:has-text("Confirmer & Payer")');

        // Success dialog check
        console.log("Verifying hotel booking success...");
        await page.waitForSelector('text=Réservation Reçue!');
        await page.click('button:has-text("Fermer")');
    });

    test('3. Pool Ticket Booking Flow (Full Day + Wallet Payment)', async ({ page }) => {
        console.log("Starting Pool Booking E2E...");
        await page.goto('/services/pool');

        // Select Mixed Category
        console.log("Selecting pool ambiance...");
        await page.waitForSelector('text=Mixte');
        await page.locator('text=Mixte').first().click();

        // Select Full Day Option
        console.log("Selecting pool formula...");
        await page.waitForSelector('text=Journée Complète');
        await page.locator('text=Journée Complète').first().click();

        // Click Book button in floating footer
        console.log("Clicking pool book button...");
        await page.click('button:has-text("Réserver Ticket")');

        // Secure payment modal should appear, choose wallet
        console.log("Paying with wallet...");
        await page.waitForSelector('text=Paiement Sécurisé');
        await page.click('text=Golden Wallet');
        await page.click('button:has-text("Confirmer & Payer")');

        // Success dialog check
        console.log("Verifying pool booking success...");
        await page.waitForSelector('text=Ticket Validé!');
        await page.click('button:has-text("Fermer")');
    });
});
