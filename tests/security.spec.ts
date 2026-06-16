import { test, expect } from '@playwright/test';

test.describe('Middleware & RBAC Security', () => {

  test('Anonymous users are blocked from admin routes', async ({ page }) => {
    // Attempt to directly visit the protected route
    await page.goto('/admin/properties');

    // The middleware should instantly catch this and redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Admin can successfully log in and reach the dashboard', async ({ page }) => {
    await page.goto('/login');

    // Fill out the form
    await page.fill('input[name="email"]', 'admin@wunkathomes.com'); // Use a test account
    await page.fill('input[name="password"]', 'SecurePassword123!');
    
    // Submit
    await page.click('button[type="submit"]');

    // Verify the server action succeeded and the middleware allowed the redirect
    await expect(page).toHaveURL(/.*\/admin\/overview/);
  });

});