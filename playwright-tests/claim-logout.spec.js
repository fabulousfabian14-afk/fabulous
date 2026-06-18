const { test, expect } = require('@playwright/test');

const DATABASE_URL = 'postgresql://kabianga_db_hl0s_user:Za7QvvmjrCTnxA7eulf7yfWOraywdXjZ@dpg-d8oiuaojs32c738dshn0-a.oregon-postgres.render.com/kabianga_db_hl0s';
const TEST_ADMIN_PASSWORD = 'security@24';

async function createTestUser(page, username, password) {
  await page.goto('/register');
  await page.fill('input[name="full_name"]', 'Playwright User');
  await page.fill('input[name="email"]', `${username}@example.com`);
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="registration_number"]', `REG-${username}`);
  await page.fill('input[name="phone"]', '0712345678');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/login/);
}

test.describe('Claim and logout flow', () => {
  test('student can claim item and logout successfully', async ({ page }) => {
    const rand = Date.now();
    const username = `pwstudent${rand}`;
    const password = 'pwtest1234';

    await createTestUser(page, username, password);
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Create a report via direct POST endpoint using browser request
    const response = await page.request.post('http://localhost:3000/_test/insert-report', {
      form: {
        title: 'Playwright Test Item',
        description: 'Auto created item',
        location: 'Test Gate',
      },
    });
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.id).toBeTruthy();

    await page.goto('/student/available');
    const claimButton = page.locator('button:has-text("Request to Claim")').first();
    await expect(claimButton).toBeVisible();
    await claimButton.click();
    await expect(page.locator('text=Claim request sent')).toBeVisible();

    await page.goto('http://localhost:3000/logout');
    await expect(page).toHaveURL(/\//);
  });
});
