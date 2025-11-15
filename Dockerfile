FROM node:alpine
RUN npm install -g pnpm
WORKDIR /usr/bin/app
COPY . /usr/bin/app
RUN pnpm install && pnpm exec prisma generate && pnpm run build
EXPOSE 80
CMD ["pnpm","run","start"]