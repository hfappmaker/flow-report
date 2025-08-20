import { test, expect } from "@playwright/test";

test.describe("契約フォームのバリデーション", () => {
  // 事前にログイン
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill("loadtest1@example.com");
    await page.locator('input[type="password"]').fill("LoadTest123!");
    await page.locator('button[type="submit"]').click({ force: true });
    await page.waitForURL("/dashboard", { timeout: 20000 });
  });

  test("担当者名とメールアドレスが空でも契約を作成できる", async ({
    page,
  }) => {
    await page.goto("/contracts");
    await page.getByRole("button", { name: "新しい契約を作成" }).click();

    // 必須項目を入力
    await page.getByLabel("契約名").fill("テスト契約");
    await page.getByLabel("クライアント名").fill("テストクライアント");
    await page.getByLabel("開始日").click();
    await page.getByRole("button", { name: "Today" }).click();

    // 担当者名とメールアドレスは空のまま

    // フォームを送信
    await page.getByRole("button", { name: "作成" }).click();

    // 成功メッセージが表示されることを確認
    await expect(page.locator("text=契約 'テスト契約' を作成しました")).toBeVisible();
  });

  test("無効なメールアドレス形式ではエラーが表示される", async ({ page }) => {
    await page.goto("/contracts");
    await page.getByRole("button", { name: "新しい契約を作成" }).click();

    // 必須項目を入力
    await page.getByLabel("契約名").fill("テスト契約");
    await page.getByLabel("クライアント名").fill("テストクライアント");
    await page.getByLabel("開始日").click();
    await page.getByRole("button", { name: "Today" }).click();

    // 無効なメールアドレスを入力
    await page.getByLabel("メールアドレス").fill("invalid-email");

    // フォームを送信
    await page.getByRole("button", { name: "作成" }).click();

    // エラーメッセージが表示されることを確認
    await expect(
      page.locator("text=有効なメールアドレスを入力してください")
    ).toBeVisible();
  });
});
