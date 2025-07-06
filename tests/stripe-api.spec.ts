import { test, expect } from '@playwright/test';

/**
 * Stripe API エンドポイントのテスト
 * 注意: これらのテストは実際のStripe APIではなく、アプリケーションのAPIをテストします
 */
test.describe('Stripe API エンドポイントテスト', () => {
  
  test.describe('/api/auth/get-subscription-info', () => {
    test('認証済みユーザーのサブスクリプション情報を取得', async ({ request }) => {
      // 実際のテストでは認証トークンを設定
      const response = await request.get('/api/auth/get-subscription-info', {
        headers: {
          'Cookie': 'test-auth-cookie=test-value', // テスト用認証情報
        },
      });
      
      if (response.status() === 200) {
        const data = await response.json();
        
        // レスポンス構造の確認
        expect(data).toHaveProperty('status');
        expect(data).toHaveProperty('currentPeriodEnd');
        
        // ステータスが有効な値であることを確認
        expect(['TRIAL', 'ACTIVE', 'CANCELED']).toContain(data.status);
        
        // 日付形式の確認
        if (data.currentPeriodEnd) {
          expect(new Date(data.currentPeriodEnd).getTime()).toBeGreaterThan(0);
        }
      } else if (response.status() === 404) {
        const error = await response.json();
        expect(error).toHaveProperty('message');
        expect(error.message).toContain('サブスクリプション情報が見つかりません');
      }
    });

    test('未認証ユーザーのアクセス拒否', async ({ request }) => {
      const response = await request.get('/api/auth/get-subscription-info');
      
      // 401 Unauthorized または 302 Redirect を期待
      expect([401, 302]).toContain(response.status());
    });

    test('不正なリクエストの処理', async ({ request }) => {
      const response = await request.get('/api/auth/get-subscription-info', {
        headers: {
          'Cookie': 'invalid-cookie=invalid-value',
        },
      });
      
      // エラーレスポンスの確認
      expect([400, 401, 500]).toContain(response.status());
      
      if (response.status() >= 400) {
        const error = await response.json();
        expect(error).toHaveProperty('message');
      }
    });
  });

  test.describe('Stripe Webhook エンドポイント', () => {
    test('/api/webhook/stripe の基本動作確認', async ({ request }) => {
      // Webhookエンドポイントの存在確認
      const response = await request.post('/api/webhook/stripe', {
        data: {},
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // 署名検証エラーが発生することを確認（正常動作）
      expect([400, 401]).toContain(response.status());
    });

    test('無効な署名でのWebhook処理', async ({ request }) => {
      const invalidWebhookPayload = {
        id: 'evt_test_webhook',
        object: 'event',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_session',
            customer: 'cus_test_customer',
            subscription: 'sub_test_subscription',
          },
        },
      };

      const response = await request.post('/api/webhook/stripe', {
        data: invalidWebhookPayload,
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'invalid_signature',
        },
      });
      
      // 署名検証エラーを期待
      expect(response.status()).toBe(400);
    });
  });

  test.describe('サーバーアクション API', () => {
    test('チェックアウトセッション作成の基本動作', async ({ request, context }) => {
      // 認証コンテキストを設定（実際のテストでは認証済みセッションを使用）
      await context.addCookies([
        {
          name: 'test-auth',
          value: 'test-session',
          domain: 'localhost',
          path: '/',
        },
      ]);

      // フォームデータとしてリクエスト（Next.js Server Actions）
      const response = await request.post('/subscription', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: 'action=createCheckoutSession',
      });
      
      // リダイレクトまたは成功レスポンスを期待
      expect([200, 302]).toContain(response.status());
    });

    test('カスタマーポータルセッション作成', async ({ request, context }) => {
      await context.addCookies([
        {
          name: 'test-auth',
          value: 'test-session',
          domain: 'localhost',
          path: '/',
        },
      ]);

      const response = await request.post('/dashboard', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: 'action=createCustomerPortalSession',
      });
      
      expect([200, 302]).toContain(response.status());
    });
  });

  test.describe('エラーハンドリングテスト', () => {
    test('サーバーエラー時のレスポンス形式', async ({ request }) => {
      // 存在しないエンドポイントにアクセス
      const response = await request.get('/api/auth/nonexistent-endpoint');
      
      expect(response.status()).toBe(404);
    });

    test('不正なJSONリクエストの処理', async ({ request }) => {
      const response = await request.post('/api/webhook/stripe', {
        data: 'invalid json data',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      expect([400, 422]).toContain(response.status());
    });

    test('レート制限のテスト', async ({ request }) => {
      // 短時間に多数のリクエストを送信
      const promises = Array.from({ length: 10 }, () =>
        request.get('/api/auth/get-subscription-info')
      );
      
      const responses = await Promise.all(promises);
      
      // 全てのレスポンスが適切に処理されることを確認
      responses.forEach((response) => {
        expect([200, 401, 429]).toContain(response.status());
      });
    });
  });

  test.describe('APIレスポンス形式の検証', () => {
    test('エラーレスポンスの形式確認', async ({ request }) => {
      const response = await request.get('/api/auth/get-subscription-info');
      
      if (response.status() >= 400) {
        const error = await response.json();
        
        // ErrorResponse型に準拠していることを確認
        expect(error).toHaveProperty('message');
        expect(typeof error.message).toBe('string');
        
        if (error.errors) {
          expect(Array.isArray(error.errors)).toBe(true);
          error.errors.forEach((err: any) => {
            expect(err).toHaveProperty('field');
            expect(err).toHaveProperty('message');
          });
        }
      }
    });

    test('成功レスポンスの形式確認', async ({ request }) => {
      // モックサーバーまたはテスト環境でのレスポンス確認
      const response = await request.get('/api/auth/get-subscription-info', {
        headers: {
          'Cookie': 'test-valid-session=test',
        },
      });
      
      if (response.status() === 200) {
        const data = await response.json();
        
        // サブスクリプション情報の形式確認
        expect(data).toBeDefined();
        
        if (data.status) {
          expect(['TRIAL', 'ACTIVE', 'CANCELED']).toContain(data.status);
        }
      }
    });
  });

  test.describe('セキュリティテスト', () => {
    test('SQLインジェクション攻撃の防御', async ({ request }) => {
      const maliciousInput = "'; DROP TABLE subscriptions; --";
      
      const response = await request.get('/api/auth/get-subscription-info', {
        headers: {
          'X-User-Id': maliciousInput,
        },
      });
      
      // サーバーがクラッシュしないことを確認
      expect([200, 400, 401, 403]).toContain(response.status());
    });

    test('XSS攻撃の防御', async ({ request }) => {
      const xssPayload = '<script>alert("xss")</script>';
      
      const response = await request.post('/api/webhook/stripe', {
        data: { malicious: xssPayload },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // レスポンスにスクリプトが含まれていないことを確認
      const responseText = await response.text();
      expect(responseText).not.toContain('<script>');
    });

    test('CSRF保護の確認', async ({ request }) => {
      // CSRFトークンなしでのリクエスト
      const response = await request.post('/subscription', {
        data: { action: 'createCheckoutSession' },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://malicious-site.com',
        },
      });
      
      // CSRF保護により拒否されることを確認
      expect([403, 422]).toContain(response.status());
    });
  });
});