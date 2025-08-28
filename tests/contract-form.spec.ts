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

  test("編集時に特定のフィールドが非活性化される", async ({ page }) => {
    const contractName = `テスト契約 ${new Date().getTime()}`;
    await page.goto("/contracts");

    // 最初にテスト用の契約を作成
    await page.getByRole("button", { name: "新しい契約を作成" }).click();
    await page.getByLabel("契約名").fill(contractName);
    await page.getByLabel("クライアント名").fill("テストクライアント");
    await page.getByLabel("開始日").click();
    await page.getByRole("button", { name: "Today" }).click();
    await page.getByRole("button", { name: "作成" }).click();
    await expect(
      page.locator(`text=契約 '${contractName}' を作成しました`)
    ).toBeVisible();

    // 作成した契約の詳細を開く
    await page
      .locator(`div:has-text("${contractName}")`)
      .getByRole("button", { name: "詳細" })
      .click();

    // 編集モードに切り替え
    await page.getByRole("button", { name: "編集" }).click();

    // 編集可能なフィールドが活性化されていることを確認
    await expect(page.getByLabel("契約名")).toBeEnabled();
    await expect(page.getByLabel("クライアント名")).toBeEnabled();
    await expect(page.getByLabel("担当者名")).toBeEnabled();
    await expect(page.getByLabel("メールアドレス")).toBeEnabled();
    await expect(page.getByLabel("基本開始時刻")).toBeEnabled();
    await expect(page.getByLabel("基本終了時刻")).toBeEnabled();
    await expect(page.getByLabel("基本休憩時間(分)")).toBeEnabled();

    // 編集不可能なフィールドが非活性化されていることを確認
    await expect(page.getByLabel("開始日")).toBeDisabled();
    await expect(page.getByLabel("終了日")).toBeDisabled();
    await expect(page.getByLabel(/^月単価/)).toBeDisabled();
    await expect(page.getByLabel("精算下限（時間）")).toBeDisabled();
    await expect(page.getByLabel("精算上限（時間）")).toBeDisabled();
    await expect(page.getByLabel(/^超過単価/)).toBeDisabled();
    await expect(page.getByLabel(/^控除単価/)).toBeDisabled();
    await expect(page.getByLabel("1日あたりの作業単位(分)")).toBeDisabled();
    await expect(page.getByLabel("1ヶ月あたりの作業単位(分)")).toBeDisabled();
    await expect(page.getByLabel("締め日")).toBeDisabled();

    // RadioGroupの確認
    await expect(
      page.locator('//label[text()="上下割"]/preceding-sibling::button')
    ).toBeDisabled();
    await expect(
      page.locator('//label[text()="中間割"]/preceding-sibling::button')
    ).toBeDisabled();
    await expect(
      page.locator('//label[text()="税込"]/preceding-sibling::button')
    ).toBeDisabled();
    await expect(
      page.locator('//label[text()="税抜"]/preceding-sibling::button')
    ).toBeDisabled();
    await expect(
      page.locator('//label[text()="切り捨て"]/preceding-sibling::button')
    ).toBeDisabled();
    await expect(
      page.locator('//label[text()="切り上げ"]/preceding-sibling::button')
    ).toBeDisabled();
    await expect(
      page.locator('//label[text()="四捨五入"]/preceding-sibling::button')
    ).toBeDisabled();
  });
});
