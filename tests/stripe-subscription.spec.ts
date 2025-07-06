import { test, expect, Page } from '@playwright/test';
import { TestUtils } from './helpers/test-utils';

// テスト用のユーザー情報
const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'testpassword123',
};

test.describe('Stripe サブスクリプションテスト', () => {
  let testUtils: TestUtils;

  test.beforeEach(async ({ page }) => {
    testUtils = new TestUtils(page);
  });

  test.describe('新規サブスクリプション作成', () => {
    test('未認証ユーザーはサブスクリプションページにアクセスできない', async ({ page }) => {
      await page.goto('/subscription');
      
      // ログインページにリダイレクトされることを確認
      await testUtils.waitForRedirect('**/auth/login**');
      await testUtils.expectPageTitle("ログイン");
    });

    test('認証済みユーザーが30日間トライアルに登録できる', async ({ page }) => {
      // ログイン
      await testUtils.login(TEST_USER.email, TEST_USER.password);
      
      // サブスクリプションページに移動
      await testUtils.goToSubscriptionPage();
      
      // トライアル登録ボタンが表示されることを確認
      const trialButton = page.locator('text=30日間無料トライアルを開始');
      await expect(trialButton).toBeVisible();
      
      // トライアル登録ボタンをクリック
      await trialButton.click();
      
      // Stripeチェックアウトページが開かれることを確認
      await testUtils.waitForStripeCheckout();
    });

    test('既存のアクティブサブスクリプションがある場合は重複登録を防ぐ', async ({ page }) => {
      // アクティブなサブスクリプションをモック
      await testUtils.mockSubscriptionAPI({
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123',
      });

      await testUtils.login(TEST_USER.email, TEST_USER.password);
      await testUtils.goToSubscriptionPage();
      
      // アクティブサブスクリプションの状態表示を確認
      await testUtils.checkSubscriptionStatus('ACTIVE');
      
      // 新規登録ボタンが表示されないことを確認
      const trialButton = page.locator('text=30日間無料トライアルを開始');
      await expect(trialButton).not.toBeVisible();
    });
  });

  test.describe('サブスクリプション状態チェック', () => {
    test('トライアル期間中のユーザー状態表示', async ({ page }) => {
      // トライアル期間中のサブスクリプションをモック
      await testUtils.mockSubscriptionAPI({
        status: 'TRIAL',
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15日後
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123',
      });

      await testUtils.login(TEST_USER.email, TEST_USER.password);
      await page.goto('/dashboard');
      
      // トライアル状態の確認
      await testUtils.checkSubscriptionStatus('TRIAL');
      
      // 残り日数の表示確認
      const statusBadge = page.locator('[data-testid="subscription-status"]');
      await expect(statusBadge).toContainText('残り');
      await expect(statusBadge).toContainText('日');
    });

    test('アクティブサブスクリプションのユーザー状態表示', async ({ page }) => {
      // アクティブなサブスクリプションをモック
      await testUtils.mockSubscriptionAPI({
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123',
      });

      await testUtils.login(TEST_USER.email, TEST_USER.password);
      await page.goto('/dashboard');
      
      // アクティブ状態の確認
      await testUtils.checkSubscriptionStatus('ACTIVE');
    });

    test('キャンセル済みサブスクリプションのユーザー状態表示', async ({ page }) => {
      // キャンセル済みサブスクリプションをモック
      await testUtils.mockSubscriptionAPI({
        status: 'CANCELED',
        currentPeriodEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5日後
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123',
      });

      await testUtils.login(TEST_USER.email, TEST_USER.password);
      await page.goto('/dashboard');
      
      // キャンセル状態の確認
      await testUtils.checkSubscriptionStatus('CANCELED');
    });
  });

  test.describe('サブスクリプション期限切れ処理', () => {
    test('期限切れユーザーは専用ページにリダイレクトされる', async ({ page }) => {
      // 期限切れのサブスクリプションをモック
      await testUtils.mockSubscriptionAPI({
        status: 'CANCELED',
        currentPeriodEnd: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1日前（期限切れ）
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123',
      });

      await testUtils.login(TEST_USER.email, TEST_USER.password);
      
      // ダッシュボードにアクセスしようとする
      await page.goto('/dashboard');
      
      // 期限切れページにリダイレクトされることを確認
      await testUtils.waitForRedirect('**/subscription/expired**');
    });

    test('期限切れページで再購読ができる', async ({ page }) => {
      await testUtils.goToExpiredSubscriptionPage();
      
      // ページタイトルの確認
      const title = page.locator('h1');
      await expect(title).toContainText('プレミアムプランが期限切れになりました');
      
      // 特徴の表示確認
      const features = page.locator('text=✓');
      await expect(features).toHaveCount(4); // 4つの特徴が表示される
      
      // 再購読ボタンをクリック
      await testUtils.clickSubscribeButton();
      
      // Stripeチェックアウトページが開かれることを確認
      await testUtils.waitForStripeCheckout();
    });

    test('期限切れページに直接アクセスできる', async ({ page }) => {
      await testUtils.goToExpiredSubscriptionPage();
      
      // ページが正常に表示されることを確認
      await expect(page.locator('text=プレミアムプランの特徴')).toBeVisible();
      await expect(page.locator('text=月額500円（税込）')).toBeVisible();
      await expect(page.locator('text=いつでもキャンセル可能')).toBeVisible();
    });
  });

  test.describe('カスタマーポータル機能', () => {
    test('アクティブサブスクリプションユーザーがカスタマーポータルにアクセスできる', async ({ page }) => {
      // アクティブなサブスクリプションをモック
      await testUtils.mockSubscriptionAPI({
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123',
      });

      await testUtils.login(TEST_USER.email, TEST_USER.password);
      await page.goto('/dashboard');
      
      // カスタマーポータルボタンが表示されることを確認
      const portalButton = page.locator('text=請求情報を管理');
      await expect(portalButton).toBeVisible();
      
      // ポータルボタンをクリック
      await testUtils.clickCustomerPortalButton();
      
      // Stripeカスタマーポータルが開かれることを確認
      await page.waitForURL('**/billing.stripe.com/**', { timeout: 30000 });
    });
  });

  test.describe('エラーハンドリング', () => {
    test('サブスクリプション情報取得エラーの処理', async ({ page }) => {
      // API エラーをモック
      await page.route('**/api/auth/get-subscription-info', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      });

      await testUtils.login(TEST_USER.email, TEST_USER.password);
      
      // エラーページまたはエラーメッセージが表示されることを確認
      await page.goto('/dashboard');
      await testUtils.waitForRedirect('**/global-error**');
    });

    test('無効なStripe設定でのエラー処理', async ({ page }) => {
      // チェックアウトセッション作成エラーをモック
      await page.route('**/subscription', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Stripe設定エラー' }),
          });
        } else {
          await route.continue();
        }
      });

      await testUtils.login(TEST_USER.email, TEST_USER.password);
      await testUtils.goToSubscriptionPage();
      
      // エラーボタンをクリック
      const trialButton = page.locator('text=30日間無料トライアルを開始');
      await trialButton.click();
      
      // エラーメッセージが表示されることを確認
      await testUtils.expectErrorMessage('Stripe設定エラー');
    });
  });

  test.describe('レスポンシブデザイン', () => {
    test('モバイル表示でのサブスクリプションページ', async ({ page }) => {
      // モバイルビューポートに設定
      await page.setViewportSize({ width: 375, height: 667 });
      
      await testUtils.goToSubscriptionPage();
      
      // モバイルでも適切に表示されることを確認
      const subscriptionCard = page.locator('[data-testid="subscription-card"]');
      await expect(subscriptionCard).toBeVisible();
      
      // ボタンがクリック可能であることを確認
      const trialButton = page.locator('text=30日間無料トライアルを開始');
      await expect(trialButton).toBeVisible();
    });
  });
});