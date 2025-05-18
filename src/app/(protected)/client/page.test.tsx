import { test, expect } from '@playwright/test';

test('Client Creation Flow Test', async ({ page }) => {
    // 1. クライアント一覧ページへ遷移
    await page.goto('/(protected)/client');
    // Wait for page data fetching to complete
    await page.waitForLoadState('networkidle');

    // 2. 「新規クライアント作成」ボタンをクリック
    await page.click('text=新規クライアント作成');

    // 3. 作成ダイアログが表示されるまで待機
    await page.waitForSelector('form');

    // 4. フォームに入力
    await page.fill('input[name="name"]', 'MCP Test Client');
    await page.fill('input[name="contactName"]', 'MCP Test User');
    await page.fill('input[name="email"]', 'mcp-test@example.com');

    // 5. 「作成」ボタンをクリック
    await page.click('text=作成');

    // 6. 成功メッセージを確認
    await expect(page.locator("text=クライアント 'MCP Test Client' を作成しました")).toBeVisible();

    // 7. 一覧に新しいクライアントが表示されていることを確認
    await expect(page.locator('text=MCP Test Client')).toBeVisible();
});
