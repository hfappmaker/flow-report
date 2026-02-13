# プロジェクト概要

## プロジェクトの目的
フリーランスエンジニア向けの勤怠管理システム。OAuth2.0 Google認証、クライアント・契約管理、勤怠表の作成・編集、Excel作業報告書生成、メール機能、freee連携、監査ログ機能を提供。

## 技術スタック
- **フロントエンド**: React 19.2.0, Next.js 16.1.5 (App Router), TypeScript 5.9.3
- **バックエンド**: Next.js API Routes / Server Actions
- **データベース**: PostgreSQL with Prisma 6.18.0
- **認証**: NextAuth.js 5.0.0-beta.30 with Google OAuth2.0
- **UI**: Radix UI, TailwindCSS, Material-UI
- **決済**: Stripe
- **状態管理**: Jotai
- **Excel処理**: ExcelJS
- **バリデーション**: Zod 4.1.12
- **テスト**: Vitest, Playwright, React Testing Library
- **開発環境**: DevContainer, pnpm
- **デプロイ**: AWS ECS, RDS (GitHub Actions経由)

## 主要機能領域 (src/features)
- admin: 管理機能
- ai: AI機能 (OpenAI, Ollama)
- auth: 認証機能
- contract: 契約管理
- dashboard: ダッシュボード
- email: メール機能 (Resend)
- freee: freee API連携
- holidays: 祝日管理
- subscription: サブスクリプション管理 (Stripe)
- user-info: ユーザー情報
- work-report: 作業報告書
