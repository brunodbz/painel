FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm install && npm cache clean --force

COPY . .

# Build do TypeScript
RUN npm run build

# Remover devDependencies após build
RUN npm prune --production

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["npm", "start"]
