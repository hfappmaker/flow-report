#!/bin/bash
# worktree作成後の初期セットアップを行うスクリプト
# Usage: ./scripts/worktree-setup.sh

set -e

# カレントディレクトリがgitリポジトリかチェック
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: このディレクトリはgitリポジトリではありません"
    exit 1
fi

REPO_ROOT=$(git rev-parse --show-toplevel)
MAIN_WORKTREE=$(git worktree list | head -n 1 | awk '{print $1}')

echo "=========================================="
echo "Worktree初期セットアップ"
echo "=========================================="
echo "現在のディレクトリ: $REPO_ROOT"
echo "メインworktree: $MAIN_WORKTREE"
echo "=========================================="
echo ""

# 1. 依存関係のインストール
echo "📦 依存関係をインストール中..."
if [ -f "pnpm-lock.yaml" ]; then
    pnpm install --frozen-lockfile
else
    pnpm install
fi
echo "✓ 依存関係のインストール完了"
echo ""

# 2. .envファイルのコピー（存在しない場合のみ）
if [ ! -f ".env.development.local" ] && [ -f "$MAIN_WORKTREE/.env.development.local" ]; then
    echo "📄 .env.development.localをコピー中..."
    cp "$MAIN_WORKTREE/.env.development.local" .env.development.local
    echo "✓ .env.development.localをコピーしました"
    echo ""
fi

if [ ! -f ".env" ] && [ -f "$MAIN_WORKTREE/.env" ]; then
    echo "📄 .envをコピー中..."
    cp "$MAIN_WORKTREE/.env" .env
    echo "✓ .envをコピーしました"
    echo ""
fi

# 3. Prisma Clientの生成
echo "🔧 Prisma Clientを生成中..."
pnpm exec prisma generate
echo "✓ Prisma Client生成完了"
echo ""

# 4. .nextディレクトリのクリーンアップ
if [ -d ".next" ]; then
    echo "🧹 .nextディレクトリをクリーンアップ中..."
    rm -rf .next
    echo "✓ .nextディレクトリをクリーンアップしました"
    echo ""
fi

echo "=========================================="
echo "✓ セットアップが完了しました！"
echo "=========================================="
echo ""
echo "開発サーバーを起動するには:"
echo "  pnpm run dev"
echo ""
