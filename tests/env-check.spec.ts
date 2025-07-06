import { test } from '@playwright/test';

test('環境変数の読み込み確認', () => {
  console.log('=== Environment Variables Check ===');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('TEST_USER_EMAIL:', process.env.TEST_USER_EMAIL);
  console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
  console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '***SET***' : 'NOT SET');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '***SET***' : 'NOT SET');
  console.log('=====================================');
});