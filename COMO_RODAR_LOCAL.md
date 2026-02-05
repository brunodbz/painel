# 🚀 Como Rodar em Desenvolvimento Local (Windows sem Docker)

## ⚠️ Situação Atual

Você modificou o código mas não está rodando o backend. Por isso ainda vê "Simulação".

## 📋 O Que Você Precisa

1. Node.js 20+ instalado
2. PostgreSQL instalado localmente OU usar serviço online
3. Yarn instalado

---

## 🔧 Opção 1: Rodar Backend + Frontend Localmente

### Passo 1: Instalar Node.js 20+

1. Baixe: https://nodejs.org/
2. Instale a versão LTS (20+)
3. Verifique: `node --version`

### Passo 2: Instalar PostgreSQL

**Opção A - Local:**
1. Baixe: https://www.postgresql.org/download/windows/
2. Instale com usuário `postgres`
3. Crie banco: 
```powershell
psql -U postgres
CREATE DATABASE soc_dashboard;
CREATE USER admin WITH PASSWORD 'sua_senha';
GRANT ALL PRIVILEGES ON DATABASE soc_dashboard TO admin;
\q
```

**Opção B - Online (mais fácil):**
1. Crie conta grátis em: https://www.elephantsql.com/
2. Copie a URL de conexão

### Passo 3: Configurar Backend

```powershell
# Entrar no diretório backend
cd backend

# Instalar dependências
npm install

# Criar arquivo .env
@"
PORT=3001
DATABASE_URL=postgres://admin:sua_senha@localhost:5432/soc_dashboard
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
"@ | Out-File -FilePath .env -Encoding UTF8

# Iniciar backend
npm run dev
```

O backend deve iniciar em `http://localhost:3001`

### Passo 4: Rodar Frontend (em outro terminal)

```powershell
# Voltar para raiz do projeto
cd ..

# Instalar dependências (se ainda não fez)
yarn install

# Iniciar frontend
yarn dev
```

O frontend abre em `http://localhost:5173`

### Passo 5: Testar

1. Acesse: `http://localhost:5173/settings`
2. Preencha campos
3. Salve
4. Deve mostrar: **"Configurações salvas com sucesso!"** (SEM "Simulação")
5. Recarregue a página
6. Campos devem estar preenchidos

---

## 🐳 Opção 2: Usar Docker (Recomendado para Produção)

Se você tem Docker Desktop instalado:

```powershell
# Criar arquivo .env na raiz
@"
POSTGRES_USER=admin
POSTGRES_PASSWORD=senha_forte_aqui
POSTGRES_DB=soc_dashboard
BACKEND_PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://localhost
FRONTEND_PORT=80
"@ | Out-File -FilePath .env -Encoding UTF8

# Build e iniciar
docker compose build --no-cache
docker compose up -d

# Ver logs
docker compose logs -f
```

Acesse: `http://localhost/settings`

---

## 🔍 Troubleshooting

### "Configurações salvas com sucesso! (Simulação)"

**Causa:** Backend não está rodando  
**Solução:** Inicie o backend (Passo 3 acima)

### Erro de conexão com banco

**Causa:** PostgreSQL não está rodando ou URL errada  
**Solução:** 
```powershell
# Verificar se PostgreSQL está rodando
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Ou use ElephantSQL (online) ao invés de local
```

### Frontend não conecta ao backend

**Causa:** CORS ou backend não iniciado  
**Solução:** 
1. Verifique se backend está em `http://localhost:3001`
2. Teste: `curl http://localhost:3001/api/health`

### Porta 3001 já em uso

```powershell
# Ver o que está usando
netstat -ano | findstr :3001

# Matar processo (substitua PID)
Stop-Process -Id PID -Force
```

---

## ✅ Verificação Rápida

### Backend funcionando:
```powershell
curl http://localhost:3001/api/health
```
Resposta esperada:
```json
{"status":"ok","timestamp":"...","database":"connected"}
```

### Frontend conectando:
1. Abra DevTools (F12) no browser
2. Vá em Console
3. Não deve ter erros de CORS ou conexão

---

## 📝 Resumo dos Comandos

```powershell
# Terminal 1 - Backend
cd backend
npm install
# Criar .env (ver Passo 3)
npm run dev

# Terminal 2 - Frontend
cd ..
yarn install
yarn dev

# Acessar
# http://localhost:5173/settings
```

---

## 🎯 Para Produção

Quando estiver tudo funcionando localmente, faça deploy:

1. Commit código
2. Push para repositório
3. No servidor Ubuntu com Docker:
   - `git pull`
   - `docker compose build --no-cache`
   - `docker compose up -d`

---

**Última Atualização:** 2026-02-04  
**Modo:** Desenvolvimento Local sem Docker
