import { Page, expect } from '@playwright/test';

/**
 * テスト用のユーティリティ関数
 */
export class TestUtils {
  
  /**
   * 環境変数の確認（デバッグ用）
   */
  static logEnvironmentVariables() {
    console.log('=== Environment Variables ===');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    console.log('TEST_USER_EMAIL:', process.env.TEST_USER_EMAIL);
    console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '***SET***' : 'NOT SET');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***SET***' : 'NOT SET');
    console.log('=============================');
  }
  constructor(private page: Page) {}

  /**
   * ログインページに移動してログインを実行
   */
  async login(email: string, password: string) {
    await this.page.goto('/auth/login');
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    
    // ログイン成功を確認（リダイレクトまたは成功メッセージを待つ）
    await this.page.waitForURL('**/dashboard', { timeout: 10000 });
  }

  /**
   * サブスクリプションページに移動
   */
  async goToSubscriptionPage() {
    await this.page.goto('/subscription');
  }

  /**
   * サブスクリプション期限切れページに移動
   */
  async goToExpiredSubscriptionPage() {
    await this.page.goto('/subscription/expired');
  }

  /**
   * プレミアムプラン登録ボタンをクリック
   */
  async clickSubscribeButton() {
    const subscribeButton = this.page.locator('text=プレミアムプランに登録');
    await expect(subscribeButton).toBeVisible();
    await subscribeButton.click();
  }

  /**
   * Stripeチェックアウトページが開かれることを確認
   */
  async waitForStripeCheckout() {
    // Stripeの新しいタブが開かれるか、リダイレクトされることを確認
    await this.page.waitForURL('**/checkout.stripe.com/**', { timeout: 30000 });
  }

  /**
   * サブスクリプション状態を確認
   */
  async checkSubscriptionStatus(expectedStatus: 'TRIAL' | 'ACTIVE' | 'CANCELED') {
    const statusBadge = this.page.locator('[data-testid="subscription-status"]');
    
    switch (expectedStatus) {
      case 'TRIAL':
        await expect(statusBadge).toContainText('トライアル期間中');
        break;
      case 'ACTIVE':
        await expect(statusBadge).toContainText('プレミアムプラン');
        break;
      case 'CANCELED':
        await expect(statusBadge).toContainText('キャンセル済み');
        break;
    }
  }

  /**
   * APIレスポンスをモック
   */
  async mockSubscriptionAPI(subscriptionData: any) {
    await this.page.route('**/api/auth/get-subscription-info', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(subscriptionData),
      });
    });
  }

  /**
   * Stripeのテストカード情報を入力
   */
  async fillStripeTestCard() {
    // Stripeテストカード番号
    await this.page.fill('input[name="cardnumber"]', '4242424242424242');
    await this.page.fill('input[name="exp-date"]', '12/34');
    await this.page.fill('input[name="cvc"]', '123');
    await this.page.fill('input[name="postal"]', '12345');
  }

  /**
   * カスタマーポータルボタンをクリック
   */
  async clickCustomerPortalButton() {
    const portalButton = this.page.locator('text=請求情報を管理');
    await expect(portalButton).toBeVisible();
    await portalButton.click();
  }

  /**
   * エラーメッセージの確認
   */
  async expectErrorMessage(message: string) {
    const errorElement = this.page.locator('[role="alert"]');
    await expect(errorElement).toContainText(message);
  }

  /**
   * 成功メッセージの確認
   */
  async expectSuccessMessage(message: string) {
    const successElement = this.page.locator('[data-testid="success-message"]');
    await expect(successElement).toContainText(message);
  }

  /**
   * ページタイトルの確認
   */
  async expectPageTitle(title: string) {
    await expect(this.page).toHaveTitle(title);
  }

  /**
   * 特定のURL パターンへのリダイレクトを待つ
   */
  async waitForRedirect(urlPattern: string, timeout: number = 10000) {
    await this.page.waitForURL(urlPattern, { timeout });
  }
}