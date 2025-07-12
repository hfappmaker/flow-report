import { test, expect } from '@playwright/test';

/**
 * テスト環境でのログイン機能テスト
 */
test.describe('テスト環境ログイン', () => {
  test('テスト環境でフォームログインが表示される', async ({ page }) => {
    await page.goto('/auth/login');
    
    // テスト環境の表示確認
    await expect(page.locator('text=テスト環境 - 開発用ログイン')).toBeVisible();
    
    // フォーム要素の確認
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('テストログイン');
    
    // クイックログインボタンの確認
    await expect(page.locator('text=テストユーザー1')).toBeVisible();
    await expect(page.locator('text=テストユーザー2')).toBeVisible();
    await expect(page.locator('text=テストユーザー3')).toBeVisible();
  });

  test('クイックログインボタンでフォームに値が入力される', async ({ page }) => {
    await page.goto('/auth/login');
    
    // テストユーザー1のクイックログインボタンをクリック
    await page.locator('text=テストユーザー1').click();
    
    // フォームに値が入力されることを確認
    await expect(page.locator('input[type="email"]')).toHaveValue('loadtest1@example.com');
    await expect(page.locator('input[type="password"]')).toHaveValue('LoadTest123!');
  });

  test('テストユーザーでのログインが成功する', async ({ page }) => {
    await page.goto('/auth/login');
    
    // テストユーザー1の認証情報を入力
    await page.locator('input[type="email"]').fill('loadtest1@example.com');
    await page.locator('input[type="password"]').fill('LoadTest123!');
    
    // ログインボタンをクリック
    await page.locator('button[type="submit"]').click();
    
    // ログイン後のリダイレクトを確認（ホームページまたはダッシュボード）
    await page.waitForURL(/\/(?!auth\/login)/);
    
    // URLがログインページ以外であることを確認
    expect(page.url()).not.toContain('/auth/login');
  });

  test('無効な認証情報でログインが失敗する', async ({ page }) => {
    await page.goto('/auth/login');
    
    // 無効な認証情報を入力
    await page.locator('input[type="email"]').fill('invalid@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    
    // ログインボタンをクリック
    await page.locator('button[type="submit"]').click();
    
    // ログインページに留まることを確認（エラーがある場合）
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/auth/login');
  });
});