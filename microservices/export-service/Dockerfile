FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

RUN apk add --no-cache bash

COPY . .
RUN npx tsc

ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

CMD ["/wait-for-it.sh", "rabbitmq:5672", "--", "npm", "start"]
