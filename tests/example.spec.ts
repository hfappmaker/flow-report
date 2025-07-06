import { test, expect } from '@playwright/test';

/**
 * サンプルテスト - Playwrightの動作確認用
 */
test.describe('基本的な動作確認', () => {
  test('ホームページの表示確認', async ({ page }) => {
    await page.goto('/');
    
    // ページタイトルの確認
    await expect(page).toHaveTitle(/WorkTimeManagement/);
  });

  test('ログインページの表示確認', async ({ page }) => {
    await page.goto('/auth/login');
    
    // ログインフォームの要素確認
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('404ページの表示確認', async ({ page }) => {
    await page.goto('/nonexistent-page');
    
    // 404ページまたはエラーページが表示されることを確認
    expect([404]).toContain(page.status);
  });
});