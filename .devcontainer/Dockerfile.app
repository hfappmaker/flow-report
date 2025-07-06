FROM mcr.microsoft.com/devcontainers/typescript-node:dev-22-bookworm
# Stripe CLIのインストール
RUN curl -sSL https://github.com/stripe/stripe-cli/releases/download/v1.27.0/stripe_1.27.0_linux_x86_64.tar.gz | tar xz -C /usr/local/bin
# 以下のコマンドでStripe CLIを使えるようにする
# stripe login
# stripe listen --forward-to localhost:3000/api/webhook/stripe
RUN npm install -g @anthropic-ai/claude-code
# Playwright browserのインストール
RUN npx playwright install --with-deps