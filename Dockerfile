FROM node:alpine
WORKDIR /usr/bin/app
COPY . /usr/bin/app
RUN npm install && npx prisma generate && npm run build
EXPOSE 80
CMD ["npm","run","start"]