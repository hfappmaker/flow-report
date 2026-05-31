FROM node:alpine
RUN npm install -g pnpm
WORKDIR /usr/bin/app
COPY . /usr/bin/app
RUN pnpm install --frozen-lockfile && pnpm exec prisma generate && pnpm run build
EXPOSE 3000
CMD ["pnpm","run","start"]