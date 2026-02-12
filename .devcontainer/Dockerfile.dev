FROM mcr.microsoft.com/devcontainers/typescript-node:dev-22-bookworm

# システムの更新とpnpmのインストール
RUN apt update && apt upgrade -y \
    && npm install -g pnpm@latest \
    && npm cache clean --force

# Stripe CLIのインストール（最新版を自動取得）
RUN STRIPE_VERSION=$(curl -s https://api.github.com/repos/stripe/stripe-cli/releases/latest | grep -oP '"tag_name": "\K(.*)(?=")') \
    && curl -sSL "https://github.com/stripe/stripe-cli/releases/download/${STRIPE_VERSION}/stripe_${STRIPE_VERSION#v}_linux_x86_64.tar.gz" | tar xz -C /usr/local/bin
# 以下のコマンドでStripe CLIを使えるようにする
# stripe login
# stripe listen --forward-to localhost:3000/api/webhook/stripe
# 以下のコマンドでStripeのイベントをテストする
# stripe fixtures /workspace/stripe.fixture.json

# GitHub CLIのインストール
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt update \
    && apt install -y gh

#uvのinstall
RUN curl -LsSf https://astral.sh/uv/install.sh | bash

# pnpmのグローバルbinディレクトリをセットアップ
ENV SHELL=/bin/bash
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN pnpm config set global-bin-dir $PNPM_HOME

# Claude Code CLIのインストール（ネイティブインストール）
RUN curl -fsSL https://claude.ai/install.sh | bash
# Playwright browserのインストール
RUN pnpm dlx playwright install
RUN pnpm dlx playwright install-deps
RUN pnpm dlx playwright install chrome
# Playwrightのインストール
RUN pnpm add -g playwright
# 日本語フォントのインストール
# sudo apt update
# sudo apt install -y fonts-noto-cjk fonts-ipafont-gothic fonts-ipafont-mincho
# Vercel CLIのインストール
RUN pnpm add -g vercel
# Playwright MCPのインストール
# RUN claude mcp add playwright -s project -- pnpm dlx -y @playwright/mcp@latest --headless --no-sandbox --isolated
# PostgreSQL MCPのインストール
# RUN claude mcp add postgresql -s project -- pnpm dlx -y @modelcontextprotocol/server-postgres@latest postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB
