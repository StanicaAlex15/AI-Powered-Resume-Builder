FROM node:18
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
RUN npx tsc
COPY . .
CMD ["npm", "start"]
