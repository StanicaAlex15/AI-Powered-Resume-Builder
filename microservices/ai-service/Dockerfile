FROM node:18-alpine
# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json before running npm ci
COPY package.json package-lock.json ./

# Install dependencies using npm ci (more reliable for CI/CD)
RUN npm ci

# Ensure TypeScript is installed and check version
RUN npx tsc --version

# Copy the rest of the application files
COPY . .

# Compile TypeScript (this step should now work if everything is set up properly)
RUN npx tsc

# Start the app using npm start (assuming the start script is correctly set)
CMD ["npm", "start"]
