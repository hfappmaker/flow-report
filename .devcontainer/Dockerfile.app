FROM mcr.microsoft.com/devcontainers/typescript-node:dev-22-bookworm

# システムの更新とnpmの最新化
RUN apt update && apt upgrade -y \
    && npm install -g npm@latest \
    && npm cache clean --force

# Stripe CLIのインストール
RUN curl -sSL https://github.com/stripe/stripe-cli/releases/download/v1.27.0/stripe_1.27.0_linux_x86_64.tar.gz | tar xz -C /usr/local/bin
# 以下のコマンドでStripe CLIを使えるようにする
# stripe login
# stripe listen --forward-to localhost:3000/api/webhook/stripe

# GitHub CLIのインストール
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt update \
    && apt install -y gh

RUN npm install -g @anthropic-ai/claude-code
RUN npx playwright install-deps
# Playwright browserのインストール
# RUN npm install -g playwright --with-deps
# RUN npm install -g @playwright/mcp@latest
# Playwright MCPのインストール
# RUN claude mcp add playwright -s project -- npx  -y @playwright/mcp@latest --headless --no-sandbox --isolated
# RUN claude mcp add postgresql -s project -- npx  -y @modelcontextprotocol/server-postgres@latest postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DB