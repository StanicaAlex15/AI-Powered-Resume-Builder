FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

RUN npx tsc --version

COPY . .

RUN npx tsc

CMD ["npm", "start"]
