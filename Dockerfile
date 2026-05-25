FROM node:22-alpine

# Set to production environment
ENV NODE_ENV=production

# Define working directory
WORKDIR /usr/src/app

# Copy package management files
COPY package*.json ./

# Install only production dependencies and clean cache
RUN npm ci --only=production && npm cache clean --force

# Copy the rest of the application source code
COPY . .

# Expose the default application port
EXPOSE 3000

# Set runtime port environment variable
ENV PORT=3000

# Start command
CMD ["node", "src/app.js"]
