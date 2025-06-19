FROM node:18-alpine

# Install dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to skip installing Chromium. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# Copy server package files
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server source
COPY server/ ./

# Create data directory
RUN mkdir -p data/screenshots

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]