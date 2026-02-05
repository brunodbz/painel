# 🔧 Correção - Backend não foi Atualizado no Docker

## ⚠️ Problema Identificado

O banco de dados está vazio porque você está rodando a **versão antiga do backend** no Docker.

As alterações feitas no código (`backend/src/server.ts`) não foram aplicadas porque você não fez rebuild do container.

---

## ✅ Solução - Rebuild do Backend

### No seu servidor Ubuntu (via SSH):

```bash
# 1. Entrar no diretório do projeto
cd /opt/painel

# 2. Parar containers
docker compose down

# 3. Rebuild do backend (IMPORTANTE!)
docker compose build backend --no-cache

# 4. Iniciar novamente
docker compose up -d

# 5. Ver logs para confirmar
docker compose logs -f backend
```

### O que você deve ver nos logs:

```
✓ Database connected successfully
✓ Database tables initialized
✓ Server running on port 3001
✓ Environment: production
```

---

## 🔍 Verificar se Funcionou

### 1. Testar endpoint de health

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

### 2. Verificar se tabelas foram criadas

```bash
docker compose exec postgres psql -U admin -d soc_dashboard

# Dentro do psql:
\dt

# Deve mostrar:
# api_settings
# settings_audit_log

# Sair:
\q
```

### 3. Testar salvamento via API

```bash
curl -X POST http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "elasticUrl": "https://elastic.test:9200",
    "elasticKey": "test-key-123"
  }'
```

Deve retornar:
```json
{
  "success": true,
  "message": "Configurações salvas com sucesso!",
  "timestamp": "..."
}
```

### 4. Verificar no banco

```bash
docker compose exec postgres psql -U admin -d soc_dashboard

SELECT * FROM api_settings;
```

Agora deve aparecer os dados!

---

## 🎯 Testar no Browser

1. Acesse: `http://SEU_IP/settings` ou `http://seu-dominio.com/settings`
2. Preencha campos
3. Salve
4. Mensagem: **"Configurações salvas com sucesso!"** (SEM "Simulação")
5. Recarregue a página
6. Campos continuam preenchidos ✅

---

## 📊 Checklist de Verificação

- [ ] Backend rebuilded: `docker compose build backend --no-cache`
- [ ] Containers reiniciados: `docker compose up -d`
- [ ] Logs mostram: "Database tables initialized"
- [ ] Tabelas criadas: `\dt` no psql mostra `api_settings`
- [ ] Healthcheck OK: `curl http://localhost:3001/api/health`
- [ ] POST funciona: teste com curl
- [ ] Browser salva sem "(Simulação)"
- [ ] Dados persistem ao recarregar página

---

## 🐛 Se Ainda Não Funcionar

### 1. Ver logs detalhados do backend

```bash
docker compose logs backend | tail -100
```

### 2. Verificar se backend está respondendo

```bash
docker compose ps backend
```

Status deve ser: **Up (healthy)**

### 3. Testar dentro do container

```bash
docker compose exec backend sh

# Dentro do container:
wget -O- http://localhost:3001/api/health
exit
```

### 4. Verificar variáveis de ambiente

```bash
docker compose exec backend env | grep DATABASE_URL
```

Deve mostrar a URL de conexão do PostgreSQL.

### 5. Forçar recriação completa

Se nada funcionar:

```bash
# Parar e remover tudo
docker compose down -v

# Rebuild completo
docker compose build --no-cache

# Iniciar
docker compose up -d

# Ver logs
docker compose logs -f
```

**⚠️ Atenção:** `-v` remove volumes, incluindo dados do banco!

---

## 📝 Resumo

**Causa:** Backend não foi rebuilded após alterações no código  
**Solução:** `docker compose build backend --no-cache`

Execute os comandos acima no seu servidor Ubuntu e teste novamente!

---

**Última Atualização:** 2026-02-04  
**Status:** Aguardando rebuild do backend no Docker
