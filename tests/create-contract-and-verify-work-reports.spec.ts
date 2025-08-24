import { test, expect } from "@playwright/test";

test.describe("契約作成と作業報告書の自動生成", () => {
  // 事前にログイン
  test.beforeEach(async ({ page }) => {
    console.log("ログイン処理を開始します。");
    await page.goto("/auth/login", { timeout: 60000 });
    console.log("ログインページに遷移しました。");
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    console.log("ページのネットワークアイドルを待機しました。");
    await page.locator('input[type="email"]').fill("loadtest1@example.com");
    console.log("メールアドレスを入力しました。");
    await page.locator('input[type="password"]').fill("LoadTest123!");
    console.log("パスワードを入力しました。");
    await page.locator('button[type="submit"]').click({ force: true });
    console.log("ログインボタンをクリックしました。");
    await page.waitForURL("/dashboard", { timeout: 60000 });
    console.log("ダッシュボードに遷移しました。");
  });

  test("契約作成時に過去の月の作業報告書が自動生成される", async ({
    page,
  }) => {
    console.log("契約作成テストを開始します。");
    await page.goto("/contracts", { timeout: 60000 });
    console.log("契約一覧ページに遷移しました。");
    await page.getByRole("button", { name: "新しい契約を作成" }).click();
    console.log("「新しい契約を作成」ボタンをクリックしました。");

    const contract_name = `テスト契約 ${new Date().getTime()}`;

    // 必須項目を入力
    await page.getByLabel("契約名").fill(contract_name);
    console.log("契約名を入力しました。");
    await page.getByLabel("クライアント名").fill("テストクライアント");
    console.log("クライアント名を入力しました。");

    // 開始日を3ヶ月前に設定
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1;

    await page.getByLabel("開始日").click();
    console.log("開始日ピッカーを開きました。");
    // カレンダーで年と月を選択
    await page.locator(`[data-testid="date-picker-year-button"]`).click();
    console.log("年選択ボタンをクリックしました。");
    await page.locator(`[data-testid="date-picker-year-select"]`).selectOption({label: `${year}`})
    console.log(`年（${year}）を選択しました。`);
    await page.locator(`[data-testid="date-picker-month-select"]`).selectOption({label: `${month}月`})
    console.log(`月（${month}）を選択しました。`);
    await page.getByRole("button", { name: "15" }).first().click(); // 15日を選択
    console.log("日（15日）を選択しました。");

    // フォームを送信
    await page.getByRole("button", { name: "作成" }).click();
    console.log("作成ボタンをクリックしました。");

    // 成功メッセージが表示されることを確認
    await expect(page.locator(`text=契約 '${contract_name}' を作成しました`)).toBeVisible({ timeout: 60000 });
    console.log("契約作成成功メッセージを検知しました。");

    // 作成した契約の作業報告書ページに遷移
    await page.getByRole("link", { name: contract_name }).click();
    console.log("作成した契約のリンクをクリックしました。");
    await page.waitForURL(/\/workReport\//, { timeout: 60000 });
    console.log("作業報告書ページに遷移しました。");

    // 作業報告書が4つ（当月分含む）作成されていることを確認
    await expect(page.locator('[data-testid^="work-report-item-"]')).toHaveCount(4, { timeout: 60000 });
    console.log("作業報告書の数（4つ）が正しいことを確認しました。");
  });
});
