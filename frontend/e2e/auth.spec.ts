import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Flow', () => {
  test('unauthenticated user is redirected to login page when visiting dashboard', async ({ page }) => {
    // Attempt to navigate to the protected dashboard page
    await page.goto('/dashboard');
    
    // Playwright will follow the redirect. Assert that the URL contains /login
    await expect(page).toHaveURL(/\/login/);
    
    // Assert that the page displays the main knowDev AI branding
    await expect(page.locator('h1')).toContainText('knowDev AI');
    
    // Verify the presence of form fields and button
    const usernameInput = page.locator('input[placeholder="e.g. developer"]');
    await expect(usernameInput).toBeVisible();
    await expect(usernameInput).toHaveValue('developer');
    
    const signInButton = page.locator('button:has-text("Sign In with Development Mode")');
    await expect(signInButton).toBeVisible();
  });
});
