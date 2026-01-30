# Guia de Troubleshooting - Docker Build

## ✅ Correções Aplicadas

### Problema 1: yarn.lock não encontrado no backend
**Erro:** `"/yarn.lock": not found`
**Causa:** Backend não usa yarn, usa npm
**Correção:** Dockerfile corrigido para usar npm

### Problema 2: npm ci requer package-lock.json
**Erro:** `npm ci can only install with an existing package-lock.json`
**Causa:** Backend não tem package-lock.json
**Correção:** Dockerfile alterado para usar `npm install` ao invés de `npm ci`

---

## 🐳 Dockerfiles Finais Corretos

### Backend Dockerfile
```dockerfile
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
```

### Frontend Dockerfile
```dockerfile
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

---

## 📋 Checklist de Verificação

Antes de fazer `docker compose build`:

- [ ] Backend usa npm (não yarn)
- [ ] Frontend usa yarn (tem yarn.lock)
- [ ] Arquivo `.dockerignore` criado
- [ ] Arquivo `backend/.dockerignore` criado
- [ ] Arquivo `.env` criado na raiz
- [ ] docker-compose.yml correto

---

## 🚀 Comandos para Build

### Build Limpo (Recomendado)

```bash
# Limpar tudo primeiro
docker compose down -v
docker system prune -a --volumes -f

# Build sem cache
docker compose build --no-cache

# Iniciar
docker compose up -d

# Verificar logs
docker compose logs -f
```

### Build Normal

```bash
docker compose build
docker compose up -d
docker compose ps
```

### Build Individual (Debug)

```bash
# Apenas backend
docker compose build backend
docker compose up backend

# Apenas frontend
docker compose build frontend
docker compose up frontend
```

---

## 🔍 Debugging

### Ver logs detalhados do build

```bash
docker compose build --progress=plain
```

### Entrar no container para debug

```bash
# Backend
docker compose run --rm backend sh

# Frontend (stage de build)
docker compose run --rm frontend sh
```

### Verificar se os arquivos foram copiados

```bash
# Backend
docker compose run --rm backend ls -la

# Ver package.json
docker compose run --rm backend cat package.json
```

---

## ⚠️ Problemas Comuns e Soluções

### Erro: "no space left on device"

```bash
# Limpar imagens não usadas
docker system prune -a --volumes

# Ver uso de espaço
docker system df
```

### Erro: "failed to solve: failed to compute cache key"

```bash
# Build sem cache
docker compose build --no-cache
```

### Erro: "denied: access forbidden"

```bash
# Verificar permissões (Linux)
sudo chown -R $USER:$USER .

# Windows: executar como administrador
```

### Erro: "Cannot connect to the Docker daemon"

```bash
# Verificar se Docker está rodando
docker info

# Iniciar Docker (Linux)
sudo systemctl start docker

# Windows: Iniciar Docker Desktop
```

### Erro: "port is already allocated"

```bash
# Ver o que está usando a porta
# Windows:
netstat -ano | findstr :80
netstat -ano | findstr :3001

# Linux:
sudo lsof -i :80
sudo lsof -i :3001

# Matar processo ou mudar porta no .env
```

---

## 🎯 Ordem de Execução Ideal

1. **Preparar Ambiente**
```bash
# Criar .env
nano .env
```

2. **Limpar Ambiente (se já tentou antes)**
```bash
docker compose down -v
docker system prune -a -f
```

3. **Build**
```bash
docker compose build --no-cache
```

4. **Verificar Build**
```bash
docker images | grep painel
```

5. **Iniciar**
```bash
docker compose up -d
```

6. **Verificar Status**
```bash
docker compose ps
```

7. **Ver Logs**
```bash
docker compose logs -f
```

8. **Testar**
```bash
curl http://localhost:3001/api/health
curl http://localhost
```

---

## 📊 Arquivos Criados/Modificados

### Novos Arquivos:
- ✅ `.dockerignore` (raiz)
- ✅ `backend/.dockerignore`

### Arquivos Corrigidos:
- ✅ `backend/Dockerfile` - usa npm install
- ✅ `GUIA_IMPLANTACAO.md` - referências atualizadas

---

## 🔄 Se Ainda Assim Der Erro

1. **Copie o erro completo**
2. **Verifique a seção exata que falhou**
3. **Teste o comando manualmente**

Exemplo:
```bash
# Se falhou no npm install
docker compose run --rm backend npm install

# Se falhou no build
docker compose run --rm backend npm run build
```

---

## ✅ Build Bem-Sucedido

Você saberá que funcionou quando ver:

```
✓ Network painel_soc_network    Created
✓ Volume painel_postgres_data   Created
✓ Container soc_postgres        Healthy
✓ Container soc_backend         Started
✓ Container soc_frontend        Started
```

E ao executar `docker compose ps`:

```
NAME              STATUS              PORTS
soc_backend       Up (healthy)        0.0.0.0:3001->3001/tcp
soc_frontend      Up (healthy)        0.0.0.0:80->80/tcp
soc_postgres      Up (healthy)        0.0.0.0:5432->5432/tcp
```

---

**Última Atualização:** 2026-01-30  
**Status:** ✅ Pronto para Build
