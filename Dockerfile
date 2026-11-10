FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install only the API dependencies first so Docker can cache this layer.
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci --omit=dev --no-audit --no-fund

# Copy the static site + backend source.
COPY . .

EXPOSE 4000
CMD ["node", "server/scripts/deploy.js"]
