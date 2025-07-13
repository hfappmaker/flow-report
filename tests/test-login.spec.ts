import { test, expect } from '@playwright/test';

/**
 * テスト環境でのログイン機能テスト
 */
test.describe('テスト環境ログイン', () => {
  test('テスト環境でフォームログインが表示される', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // テスト環境の表示確認
    await expect(page.locator('text=テスト環境 - 開発用ログイン')).toBeVisible();
    
    // フォーム要素の確認
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('テストログイン');
    
    // クイックログインボタンの確認
    await expect(page.getByRole('button', { name: 'テストユーザー1' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'テストユーザー2' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'テストユーザー3' })).toBeVisible();
  });

  test('クイックログインボタンでフォームに値が入力される', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    const button = page.getByRole('button', { name: 'テストユーザー1' });
    // クイックログインボタンが表示されていることを確認
    await expect(button).toBeVisible();
    // ボタンがクリック可能になるまで待機
    await button.waitFor({ state: 'attached' });
    await page.waitForTimeout(1000); // 追加の待機時間
    // クイックログインボタンをクリック
    await button.click({ force: true });
    // フォームに値が入力されることを確認
    await expect(page.locator('input[type="email"]')).toHaveValue('loadtest1@example.com');
    await expect(page.locator('input[type="password"]')).toHaveValue('LoadTest123!');
  });

  test('サブスクリプション購読済みテストユーザーでのログインが成功', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // ログインページのURLを確認
    expect(page.url()).toContain('/auth/login');
    // テストユーザー1の認証情報を入力
    await page.locator('input[type="email"]').fill('loadtest1@example.com');
    await page.locator('input[type="password"]').fill('LoadTest123!');
    // ログインボタンをクリック
    await page.locator('button[type="submit"]').click({ force: true });

    // ログイン後のページが読み込まれるまで待機
    await page.waitForURL('/dashboard', { timeout: 20000 });
  });

  test('サブスクリプション未購読テストユーザーでのログインが成功する', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // ログインページのURLを確認
    expect(page.url()).toContain('/auth/login');
    // テストユーザー1の認証情報を入力
    await page.locator('input[type="email"]').fill('loadtest2@example.com');
    await page.locator('input[type="password"]').fill('LoadTest123!');
    // ログインボタンをクリック
    await page.locator('button[type="submit"]').click({ force: true });

    // ログイン後のページが読み込まれるまで待機
    await page.waitForURL('/subscription', { timeout: 20000 });
  });

  test('サブスクリプションキャンセル済みテストユーザーでのログインが成功する', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    // ログインページのURLを確認
    expect(page.url()).toContain('/auth/login');
    // テストユーザー1の認証情報を入力
    await page.locator('input[type="email"]').fill('loadtest3@example.com');
    await page.locator('input[type="password"]').fill('LoadTest123!');
    // ログインボタンをクリック
    await page.locator('button[type="submit"]').click({ force: true });

    // ログイン後のページが読み込まれるまで待機
    await page.waitForURL('/subscription/expired', { timeout: 20000 });
  });

  test('無効な認証情報でログインが失敗する', async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');

    // 無効な認証情報を入力
    await page.locator('input[type="email"]').fill('invalid@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    
    // ログインボタンをクリック
    await page.locator('button[type="submit"]').click({ force: true });
    
    // ログインページに留まることを確認（エラーがある場合）
    // エラーメッセージが表示されるまで待機
    await expect(page.locator('text=User not registered!')).toBeVisible();
  });
});