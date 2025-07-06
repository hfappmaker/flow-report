# Stripe サブスクリプション Playwright テスト

このディレクトリには、WorkTimeManagementV2 アプリケーションのStripeサブスクリプション機能に対するE2Eテストが含まれています。

## テストファイル構成

### 主要テストファイル

- **`stripe-subscription.spec.ts`** - メインのサブスクリプション機能テスト
  - 新規サブスクリプション作成
  - サブスクリプション状態チェック
  - 期限切れ処理
  - カスタマーポータル機能
  - エラーハンドリング
  - レスポンシブデザイン

- **`stripe-api.spec.ts`** - API エンドポイントテスト
  - REST API のテスト
  - Webhook エンドポイントテスト
  - セキュリティテスト
  - エラーレスポンス形式検証

- **`example.spec.ts`** - 基本動作確認テスト
  - Playwright 動作確認用サンプル

### ヘルパーファイル

- **`helpers/test-utils.ts`** - テスト用ユーティリティクラス
  - ログイン処理
  - サブスクリプション操作
  - Stripe UI 操作
  - API モック機能

## セットアップ

### 1. 環境変数の設定

`.env.test` ファイルを作成し、テスト用の設定を行ってください：

```bash
cp .env.test.example .env.test
```

### 2. テスト用データベースの準備

```bash
# テスト用データベースのマイグレーション
npm run db:migrate:test

# テストデータの投入
npm run db:seed:test
```

### 3. Playwrightブラウザのインストール

```bash
npx playwright install
```

## テスト実行

### 全テストの実行

```bash
npm run test:p
```

### 特定のテストファイルの実行

```bash
# Stripe サブスクリプションテストのみ
npx playwright test stripe-subscription.spec.ts

# API テストのみ
npx playwright test stripe-api.spec.ts
```

### ヘッドレスモードでの実行

```bash
npx playwright test --headed
```

### デバッグモード

```bash
npx playwright test --debug
```

### 特定のブラウザでの実行

```bash
# Chrome のみ
npx playwright test --project=chromium

# Firefox のみ
npx playwright test --project=firefox

# Safari のみ
npx playwright test --project=webkit
```

## テストケース詳細

### 新規サブスクリプション作成テスト

1. **未認証ユーザーのアクセス制限**
   - 未認証でサブスクリプションページにアクセス
   - ログインページへのリダイレクト確認

2. **30日間トライアル登録**
   - 認証済みユーザーのトライアル登録
   - Stripeチェックアウトページへの遷移確認

3. **重複登録の防止**
   - 既存のアクティブサブスクリプションがある場合の処理
   - 新規登録ボタンの非表示確認

### サブスクリプション状態チェックテスト

1. **トライアル期間中の表示**
   - ステータスバッジの表示確認
   - 残り日数の表示確認

2. **アクティブサブスクリプションの表示**
   - プレミアムプランステータスの確認

3. **キャンセル済みサブスクリプションの表示**
   - キャンセルステータスの確認

### 期限切れ処理テスト

1. **自動リダイレクト**
   - 期限切れユーザーの専用ページリダイレクト
   - ミドルウェアによるアクセス制御確認

2. **再購読機能**
   - 期限切れページでの再購読操作
   - Stripeチェックアウトページへの遷移

### API テスト

1. **認証・認可**
   - 適切な認証チェック
   - 未認証アクセスの拒否

2. **エラーハンドリング**
   - サーバーエラー時のレスポンス
   - 不正なリクエストの処理

3. **セキュリティ**
   - SQLインジェクション攻撃の防御
   - XSS攻撃の防御
   - CSRF保護の確認

## モック機能

### サブスクリプション状態のモック

テストでは実際のStripe APIを呼び出さずに、モック機能を使用してサブスクリプション状態をシミュレートします：

```typescript
await testUtils.mockSubscriptionAPI({
  status: 'ACTIVE',
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  stripeCustomerId: 'cus_test123',
  stripeSubscriptionId: 'sub_test123',
});
```

### API レスポンスのモック

```typescript
await page.route('**/api/auth/get-subscription-info', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(mockData),
  });
});
```

## テストデータ

### テスト用ユーザー

```typescript
const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
};
```

### Stripe テストカード情報

```typescript
// 成功する決済
cardNumber: '4242424242424242'
expiry: '12/34'
cvc: '123'

// 失敗する決済
cardNumber: '4000000000000002'
```

## トラブルシューティング

### よくある問題

1. **テストが失敗する場合**
   - 環境変数が正しく設定されているか確認
   - テスト用データベースが準備されているか確認
   - アプリケーションが正常に起動しているか確認

2. **Stripe関連のテストが失敗する場合**
   - Stripeのテストキーが正しく設定されているか確認
   - Webhook署名の検証が正常に動作しているか確認

3. **認証関連のテストが失敗する場合**
   - NextAuthの設定が正しいか確認
   - テスト用セッションの生成が正常に動作しているか確認

### デバッグ方法

1. **スクリーンショット確認**
   ```bash
   npx playwright test --debug
   ```

2. **ビデオ録画**
   ```bash
   npx playwright test --video=on
   ```

3. **ブラウザ開発者ツール**
   ```bash
   npx playwright test --headed --slowMo=1000
   ```

## CI/CD での実行

### GitHub Actions 設定例

```yaml
- name: Run Playwright tests
  run: npx playwright test
  env:
    STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}
    DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
```

## 更新・メンテナンス

### 新機能追加時

1. 新しいテストケースの追加
2. モック機能の更新
3. テストユーティリティの拡張

### Stripeアップデート時

1. Stripe APIバージョンの確認
2. Webhook イベントの変更確認
3. テストカード情報の更新確認

## 参考資料

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)