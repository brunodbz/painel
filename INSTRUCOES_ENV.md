# Instruções - Variáveis de Ambiente

## ⚠️ IMPORTANTE - Leia Antes de Fazer Deploy

Por questões de segurança, os arquivos de variáveis de ambiente (`.env`) **NÃO** devem ser commitados no Git. Você precisa criá-los manualmente no servidor.

---

## 📝 Arquivos que Você Precisa Criar

### 1. `.env` (Raiz do Projeto)

Este arquivo configura o Docker Compose. Crie na raiz do projeto:

```bash
nano .env
```

Cole o seguinte conteúdo e **AJUSTE OS VALORES**:

```env
# Configurações do Banco de Dados
POSTGRES_USER=admin
POSTGRES_PASSWORD=TROQUE_POR_UMA_SENHA_FORTE_AQUI
POSTGRES_DB=soc_dashboard

# Configurações do Backend
BACKEND_PORT=3001
NODE_ENV=production

# CORS Origins - IMPORTANTE: Ajustar para seu domínio
# Separar múltiplas origens com vírgula
CORS_ORIGIN=http://seu-dominio.com,https://seu-dominio.com

# Configurações do Frontend
FRONTEND_PORT=80
```

**⚠️ ATENÇÃO:**
- Troque `TROQUE_POR_UMA_SENHA_FORTE_AQUI` por uma senha realmente forte
- Troque `seu-dominio.com` pelo seu domínio real (ou IP do servidor)
- Se estiver testando localmente, pode usar: `CORS_ORIGIN=http://localhost:80`

---

### 2. `.env.example` (Raiz do Projeto)

Este arquivo serve como documentação. **Não contém valores sensíveis.**

```bash
nano .env.example
```

```env
# Frontend Environment Variables

# URL da API Backend (ajustar conforme ambiente)
VITE_API_URL=http://localhost:3001

# Outras configurações podem ser adicionadas aqui conforme necessário
```

**Nota:** Este arquivo PODE ser commitado no Git.

---

### 3. `backend/.env.example` (Diretório Backend)

```bash
nano backend/.env.example
```

```env
# Backend Environment Variables

# Porta do servidor
PORT=3001

# Database Connection String
# Formato: postgres://usuario:senha@host:porta/nome_do_banco
DATABASE_URL=postgres://admin:secure_password@postgres:5432/soc_dashboard

# Node Environment (development, production, test)
NODE_ENV=production

# CORS Origins (separar múltiplas origens com vírgula)
CORS_ORIGIN=http://localhost:5173,http://localhost:80

# Configurações de API externas (exemplo para futura implementação)
# ELASTIC_URL=
# ELASTIC_API_KEY=
# DEFENDER_API_KEY=
# OPENCTI_URL=
# OPENCTI_API_KEY=
# TENABLE_ACCESS_KEY=
# TENABLE_SECRET_KEY=
```

**Nota:** Este arquivo PODE ser commitado no Git (serve como template).

---

## 🔐 Gerando Senhas Fortes

### No Linux/Ubuntu:

```bash
# Gerar senha aleatória de 32 caracteres
openssl rand -base64 32
```

### Ou use um gerenciador de senhas online:
- https://passwordsgenerator.net/
- https://1password.com/password-generator/

**Recomendações:**
- Mínimo 20 caracteres
- Mistura de letras maiúsculas, minúsculas, números e símbolos
- Não use palavras do dicionário
- Não reutilize senhas

---

## 📋 Checklist de Configuração

Antes de fazer `docker compose up`, verifique:

- [ ] Arquivo `.env` criado na raiz do projeto
- [ ] Senha do PostgreSQL alterada (não é mais "secure_password")
- [ ] CORS_ORIGIN ajustado com seu domínio ou IP
- [ ] Se for produção, NODE_ENV=production
- [ ] Portas corretas configuradas (80 para web, 3001 para API)

---

## 🚀 Ordem de Criação dos Arquivos

Para facilitar, siga esta ordem:

### Primeiro Deploy (Com Docker):

```bash
# 1. Entre no diretório do projeto
cd ~/painel

# 2. Crie o arquivo .env principal
nano .env
# Cole o conteúdo ajustado e salve (Ctrl+X, Y, Enter)

# 3. Verifique se está correto
cat .env

# 4. Faça o build e suba os containers
docker compose build
docker compose up -d

# 5. Verifique se está funcionando
docker compose ps
docker compose logs -f
```

### Deploy Manual (Sem Docker):

```bash
# 1. Crie variáveis do backend
cd ~/painel/backend
nano .env
# Cole conteúdo ajustado

# 2. Crie variáveis do frontend (se necessário)
cd ~/painel
nano .env
# Cole conteúdo ajustado

# 3. Teste o backend
cd backend
yarn build
yarn start
# Deve iniciar sem erros
```

---

## 🔍 Verificando se Está Correto

### Teste 1: Backend Reconhece Variáveis

```bash
# Docker
docker exec soc_backend env | grep -E "DATABASE_URL|CORS_ORIGIN|NODE_ENV"

# Manual
cd backend && node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

### Teste 2: Conexão com Banco de Dados

```bash
# Docker
docker exec soc_postgres psql -U admin -d soc_dashboard -c "SELECT 1;"

# Manual
psql -U admin -d soc_dashboard -c "SELECT 1;"
```

### Teste 3: Healthcheck da API

```bash
curl http://localhost:3001/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected"
}
```

---

## ❌ Erros Comuns

### Erro: "role 'admin' does not exist"

**Causa:** Senha ou usuário incorretos no DATABASE_URL

**Solução:**
1. Verifique o arquivo `.env`
2. Certifique-se que POSTGRES_USER, POSTGRES_PASSWORD e DATABASE_URL estão corretos
3. Recrie os containers: `docker compose down -v && docker compose up -d`

### Erro: "CORS policy blocked"

**Causa:** Frontend não está na lista CORS_ORIGIN

**Solução:**
1. Abra o arquivo `.env`
2. Adicione a URL do frontend em CORS_ORIGIN
3. Reinicie o backend: `docker compose restart backend`

### Erro: "Cannot connect to database"

**Causa:** DATABASE_URL incorreta ou banco não iniciado

**Solução:**
1. Verifique se o PostgreSQL está rodando: `docker compose ps postgres`
2. Verifique a DATABASE_URL no .env
3. Veja os logs: `docker compose logs postgres`

---

## 📌 Dicas Importantes

1. **Nunca commite o arquivo .env no Git**
   ```bash
   # Verifique se .env está no .gitignore
   cat .gitignore | grep .env
   ```

2. **Faça backup das suas variáveis**
   ```bash
   # Copie para um local seguro fora do servidor
   cp .env .env.backup
   ```

3. **Use variáveis diferentes para cada ambiente**
   - Desenvolvimento: senhas simples, CORS aberto
   - Produção: senhas fortes, CORS restrito

4. **Documente suas configurações customizadas**
   - Se adicionar novas variáveis, atualize os arquivos .example

---

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique se seguiu todos os passos
2. Confira os logs: `docker compose logs -f`
3. Consulte o `GUIA_IMPLANTACAO.md` seção "Solução de Problemas"
4. Verifique se não há erros de digitação nos arquivos .env

---

**Lembre-se:** Segurança é fundamental! Nunca exponha suas variáveis de ambiente publicamente.
