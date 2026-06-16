import { test, expect } from '@playwright/test';

test.describe('AI Tools Page Route Guard', () => {
  test('unauthenticated user trying to visit tools page is redirected to login', async ({ page }) => {
    // Navigate to protected tools page
    await page.goto('/dashboard/tools');
    
    // Asserts that user is redirected to login URL
    await expect(page).toHaveURL(/\/login/);
    
    // Check that login header is visible
    await expect(page.locator('h1')).toContainText('knowDev AI');
  });
});
