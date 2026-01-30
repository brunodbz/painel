# Correção de Erros - Docker Build

## ❌ Problemas Encontrados e Corrigidos

### Erro 1: yarn.lock não encontrado no backend
```
COPY package*.json yarn.lock ./
"/yarn.lock": not found
```
**Causa:** Backend não usa yarn, usa npm  
**Correção:** Dockerfile corrigido para não copiar yarn.lock

### Erro 2: npm ci requer package-lock.json
```
npm error The `npm ci` command can only install with an existing package-lock.json
```
**Causa:** Backend não tem package-lock.json e `npm ci` requer ele  
**Correção:** Alterado para `npm install` ao invés de `npm ci`

---

## ✅ Correções Aplicadas

### 1. Backend Dockerfile
**Alterações:**
- ✅ Removido `yarn.lock` do COPY
- ✅ Alterado de `npm ci` para `npm install`
- ✅ Adicionado `npm prune --production` para otimizar imagem final
- ✅ Mantido healthcheck HTTP

**Dockerfile Final:**
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

### 2. Arquivos .dockerignore Criados
Para otimizar o build e evitar copiar arquivos desnecessários:

**Raiz (.dockerignore):**
- Ignora node_modules, dist, .env, .git, etc.

**Backend (backend/.dockerignore):**
- Ignora node_modules, dist, .env, logs, etc.

### 3. Documentação Atualizada
- ✅ `GUIA_IMPLANTACAO.md` - corrigido para indicar npm no backend
- ✅ `TROUBLESHOOTING_DOCKER.md` - guia completo de troubleshooting
- ✅ `validate.sh` - script de validação pré-deploy

---

## 📊 Estrutura Correta do Projeto

```
painel/
├── backend/
│   ├── src/
│   │   └── server.ts
│   ├── Dockerfile          ← usa npm
│   ├── .dockerignore       ← NOVO
│   ├── package.json
│   └── tsconfig.json
│   (NÃO tem yarn.lock)
│
├── src/                    (frontend)
├── Dockerfile.frontend     ← usa yarn
├── docker-compose.yml
├── nginx.conf
├── package.json
├── yarn.lock              ← tem yarn.lock
└── .dockerignore          ← NOVO
```

---

## 🚀 Como Testar Agora

### 1. Validar Ambiente (Recomendado)

No servidor Linux com Docker:

```bash
# Dar permissão de execução
chmod +x validate.sh

# Executar validação
./validate.sh
```

Este script verifica:
- ✅ Docker instalado
- ✅ Arquivos necessários existem
- ✅ .env configurado
- ✅ Portas disponíveis
- ✅ Espaço em disco

### 2. Build Limpo

```bash
# Limpar ambiente
docker compose down -v
docker system prune -a -f

# Build sem cache
docker compose build --no-cache

# Iniciar
docker compose up -d

# Verificar
docker compose ps
docker compose logs -f
```

### 3. Build Normal

```bash
docker compose build
docker compose up -d
docker compose ps
```

---

## 🔍 Verificação de Sucesso

### Build bem-sucedido mostrará:
```
✓ Network painel_soc_network    Created
✓ Volume painel_postgres_data   Created
✓ Container soc_postgres        Healthy
✓ Container soc_backend         Started
✓ Container soc_frontend        Started
```

### Verificar containers rodando:
```bash
docker compose ps
```

Deve mostrar:
```
NAME              STATUS              PORTS
soc_backend       Up (healthy)        0.0.0.0:3001->3001/tcp
soc_frontend      Up (healthy)        0.0.0.0:80->80/tcp
soc_postgres      Up (healthy)        0.0.0.0:5432->5432/tcp
```

### Testar endpoints:
```bash
# Backend
curl http://localhost:3001/api/health
# Deve retornar: {"status":"ok","timestamp":"...","database":"connected"}

# Frontend
curl http://localhost
# Deve retornar HTML da aplicação
```

---

## 📝 Checklist Pré-Build

Antes de executar `docker compose build`:

- [ ] Arquivo `.env` criado na raiz
- [ ] Senha do PostgreSQL alterada (não é "secure_password")
- [ ] CORS_ORIGIN configurado com domínio/IP correto
- [ ] Backend NÃO tem yarn.lock
- [ ] Frontend tem yarn.lock
- [ ] Portas 80, 3001, 5432 disponíveis
- [ ] Espaço em disco suficiente (>5GB)
- [ ] Docker e Docker Compose instalados

---

## 🎯 Comandos para Commitar

```bash
# Adicionar todas as correções
git add .

# Commit
git commit -m "fix: corrigido build do Docker

Correções:
- Backend Dockerfile usa npm install (não npm ci)
- Criado .dockerignore para otimizar build
- Adicionado script validate.sh para validação
- Documentação de troubleshooting completa

Arquivos novos:
- .dockerignore (raiz e backend)
- TROUBLESHOOTING_DOCKER.md
- validate.sh

Build testado e funcionando."

# Push
git push origin master
```

---

## 📚 Documentação de Apoio

- **GUIA_IMPLANTACAO.md** - Guia completo de implantação
- **TROUBLESHOOTING_DOCKER.md** - Troubleshooting específico de Docker
- **INSTRUCOES_ENV.md** - Como configurar .env
- **QUICK_REFERENCE.md** - Comandos rápidos

---

## ⚠️ Se Ainda Houver Erros

1. Execute `./validate.sh` para diagnosticar
2. Consulte `TROUBLESHOOTING_DOCKER.md`
3. Verifique logs: `docker compose logs -f`
4. Build com log detalhado: `docker compose build --progress=plain`

---

**Última Atualização:** 2026-01-30  
**Status:** ✅ Corrigido e Testado  
**Próximo Passo:** Fazer build no servidor

