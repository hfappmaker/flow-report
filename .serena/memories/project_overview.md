# プロジェクト概要

## プロジェクトの目的
フリーランスエンジニア向けの勤怠管理システム。OAuth2.0 Google認証、クライアント・契約管理、勤怠表の作成・編集、Excel作業報告書生成、メール機能、監査ログ機能を提供。

## 技術スタック
- **フロントエンド**: React v19, Next.js (App Router), TypeScript
- **バックエンド**: Next.js API Routes
- **データベース**: PostgreSQL with Prisma ORM
- **認証**: NextAuth.js with Google OAuth2.0
- **UI**: Radix UI, TailwindCSS, Material-UI
- **決済**: Stripe
- **状態管理**: Jotai
- **Excel処理**: ExcelJS
- **バリデーション**: Zod
- **テスト**: Jest, Playwright, React Testing Library
- **開発環境**: DevContainer
- **デプロイ**: AWS ECS, RDS

## 主要機能領域
- admin: 管理機能
- ai: AI機能
- auth: 認証機能
- contract: 契約管理
- dashboard: ダッシュボード
- email: メール機能
- subscription: サブスクリプション管理
- work-report: 作業報告書