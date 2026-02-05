# ⚡ COMANDOS RÁPIDOS - Deploy das Integrações

## 📦 TRANSFERIR PARA SERVIDOR

### Opção 1: Comprimir e Enviar Tudo

```powershell
# No Windows PowerShell
cd C:\Users\Bruno\OneDrive\Documentos2\painel

# Comprimir backend/src
Compress-Archive -Path backend\src\* -DestinationPath backend-src.zip -Force

# Enviar para servidor
scp backend-src.zip kryptus@SEU_IP:/tmp/
```

### Opção 2: Apenas os Serviços Novos

```powershell
# Comprimir apenas services
Compress-Archive -Path backend\src\services\* -DestinationPath services.zip -Force

# Enviar
scp services.zip kryptus@SEU_IP:/tmp/
scp backend\src\server.ts kryptus@SEU_IP:/tmp/server.ts
```

---

## 🚀 EXECUTAR NO SERVIDOR

### Conectar via SSH

```bash
ssh kryptus@SEU_IP
```

### Deploy Completo (Opção 1)

```bash
# Extrair arquivos
cd /tmp
unzip -o backend-src.zip -d /opt/painel/backend/src/

# Rebuild e restart
cd /opt/painel
docker compose build backend --no-cache
docker compose down
docker compose up -d

# Ver logs
docker compose logs backend --tail 50
```

### Deploy Apenas Serviços (Opção 2)

```bash
# Extrair serviços
cd /tmp
unzip -o services.zip -d /opt/painel/backend/src/services/

# Copiar server.ts
cp /tmp/server.ts /opt/painel/backend/src/server.ts

# Rebuild e restart
cd /opt/painel
docker compose build backend --no-cache
docker compose down
docker compose up -d

# Ver logs
docker compose logs backend --tail 50
```

---

## ✅ VALIDAR DEPLOY

### 1. Status dos Containers

```bash
docker compose ps
```

**Esperado:** Todos `Up (healthy)`

### 2. Logs do Backend

```bash
docker compose logs backend --tail 50
```

**Esperado:**
```
✓ Database connected successfully
✓ Database tables initialized
✓ Server running on port 3001
```

### 3. Testar API

```bash
curl http://localhost:3001/api/dashboard | jq
```

**Esperado:** JSON com 5 arrays (vazios se não configurado)

---

## ⚙️ CONFIGURAR APIs

### 1. Acessar Painel

```
http://SEU_IP/settings
```

### 2. Preencher Credenciais

#### Elasticsearch (opcional)
- **URL:** `https://your-cluster:9200`
- **Username:** `soc_dashboard`
- **Password:** `sua_senha`

#### Microsoft Defender (opcional)
- **Tenant ID:** `87654321-4321-...`
- **Client ID:** `12345678-1234-...`
- **Client Secret:** `ABC~123DEF...`

#### OpenCTI (opcional)
- **URL:** `https://your-opencti.com`
- **Token:** `abcd1234-ef56-...`

#### Tenable (obrigatório - já configurado?)
- **Access Key:** `61b9ab917561abb22927...`
- **Secret Key:** `df3e443cb6debcc3f60a...`

#### RSS Feeds (recomendado)
```
https://feeds.feedburner.com/TheHackersNews
https://www.bleepingcomputer.com/feed/
https://krebsonsecurity.com/feed/
https://www.cisa.gov/uscert/ncas/current-activity.xml
```

### 3. Salvar e Aguardar

- Clique em **Salvar Configurações**
- Aguarde 30 segundos
- Dashboard atualiza automaticamente

---

## 🔍 VERIFICAR FUNCIONAMENTO

### Ver Logs de Integração

```bash
docker compose logs backend | grep -E "Fetched|Error"
```

**Sucesso:**
```
✓ Fetched 5 alerts from Elasticsearch
✓ Fetched 3 alerts from Microsoft Defender
✓ Fetched 7 threats from OpenCTI
✓ Fetched 10 vulnerabilities from Tenable
✓ Fetched 8 news from RSS feeds
```

**Erro de Autenticação:**
```
Error fetching Elasticsearch data: 401 Unauthorized
Error fetching Defender data: Invalid client secret
```

### Verificar Configurações no Banco

```bash
docker compose exec postgres psql -U admin -d soc_dashboard
```

```sql
SELECT service_name, is_active 
FROM api_settings 
WHERE is_active = true;
```

```sql
\q
```

### Testar no Browser

1. Acesse: `http://SEU_IP/`
2. Verifique cards de todas as APIs
3. Verifique dados populados
4. F12 → Console → Verificar erros

---

## 🐛 TROUBLESHOOTING RÁPIDO

### Container Não Inicia

```bash
# Ver erro
docker compose logs backend

# Rebuild forçado
docker compose build backend --no-cache --pull
docker compose up -d backend
```

### Erro 401/403 em Alguma API

```bash
# Ver logs específicos
docker compose logs backend | grep -i "NOME_DA_API"

# Reconfigurar credenciais
# Acesse: http://SEU_IP/settings
```

### Dashboard Vazio

```bash
# Verificar se salvou no banco
docker compose exec postgres psql -U admin -d soc_dashboard \
  -c "SELECT service_name FROM api_settings WHERE is_active = true;"

# Se vazio, reconfigurar em /settings
```

### Logs em Tempo Real

```bash
docker compose logs -f backend
```

**Parar:** `Ctrl+C`

---

## 📊 COMANDOS DE DIAGNÓSTICO

```bash
# Status geral
docker compose ps

# Logs backend (últimas 100 linhas)
docker compose logs backend --tail 100

# Logs apenas erros
docker compose logs backend | grep -i error

# Logs de integração
docker compose logs backend | grep -E "Fetched|Error"

# Configurações ativas
docker compose exec postgres psql -U admin -d soc_dashboard \
  -c "SELECT service_name, is_active, updated_at FROM api_settings;"

# Testar API
curl http://localhost:3001/api/dashboard | jq

# Testar API específica
curl http://localhost:3001/api/dashboard | jq .tenable
curl http://localhost:3001/api/dashboard | jq .elastic
curl http://localhost:3001/api/dashboard | jq .defender
curl http://localhost:3001/api/dashboard | jq .opencti
curl http://localhost:3001/api/dashboard | jq .rss
```

---

## 🔄 RESTART/REBUILD

### Restart Apenas Backend

```bash
docker compose restart backend
docker compose logs -f backend
```

### Rebuild Backend

```bash
docker compose build backend --no-cache
docker compose up -d backend
docker compose logs -f backend
```

### Restart Tudo

```bash
cd /opt/painel
docker compose down
docker compose up -d
docker compose ps
```

---

## 📚 DOCUMENTAÇÃO

### Leia Primeiro
1. **`RESUMO_IMPLEMENTACAO.md`** - Visão geral completa
2. **`DEPLOY_INTEGRACOES.md`** - Deploy passo a passo
3. **`CONFIGURACAO_APIS.md`** - Configurar cada API

### Para Troubleshooting
- **`DEPLOY_INTEGRACOES.md`** - Seção "Troubleshooting"
- **`CONFIGURACAO_APIS.md`** - Seção de cada API

### Para Deploy do Tenable (se precisar)
- **`RESUMO_CORRECAO.md`**
- **`GUIA_RAPIDO_DEPLOY.md`**

---

## ✅ CHECKLIST RÁPIDO

### Deploy
- [ ] Arquivos transferidos para `/tmp/`
- [ ] Extraídos em `/opt/painel/backend/src/`
- [ ] Backend rebuilded: `docker compose build backend --no-cache`
- [ ] Containers restartados: `docker compose up -d`
- [ ] Logs sem erros: `docker compose logs backend`

### Configuração
- [ ] Acessado `/settings`
- [ ] Configurado APIs que usar
- [ ] Salvo configurações
- [ ] Aguardado 30s

### Validação
- [ ] Dashboard carrega: `http://SEU_IP/`
- [ ] Cards aparecem
- [ ] Dados populam (se configurado)
- [ ] Logs mostram "Fetched X items"
- [ ] Sem erros: `docker compose logs backend | grep -i error`

---

## 🎯 ORDEM DE EXECUÇÃO

```bash
# 1. Transferir arquivos (PowerShell no Windows)
cd C:\Users\Bruno\OneDrive\Documentos2\painel
Compress-Archive -Path backend\src\* -DestinationPath backend-src.zip -Force
scp backend-src.zip kryptus@SEU_IP:/tmp/

# 2. Conectar ao servidor
ssh kryptus@SEU_IP

# 3. Extrair e deploy
cd /tmp
unzip -o backend-src.zip -d /opt/painel/backend/src/
cd /opt/painel
docker compose build backend --no-cache
docker compose down
docker compose up -d

# 4. Verificar
docker compose ps
docker compose logs backend --tail 50
curl http://localhost:3001/api/dashboard | jq

# 5. Configurar
# Acesse: http://SEU_IP/settings
# Preencha credenciais das APIs
# Salve

# 6. Validar
docker compose logs backend | grep -E "Fetched|Error"
# Acesse: http://SEU_IP/
# Verifique cards populados
```

---

## 📞 SE PRECISAR DE AJUDA

```bash
# Salvar logs completos
docker compose logs backend > /tmp/backend-full.log
docker compose ps > /tmp/containers-status.txt

# Ver últimas 200 linhas
cat /tmp/backend-full.log | tail -200

# Procurar erros específicos
grep -i "elasticsearch" /tmp/backend-full.log
grep -i "defender" /tmp/backend-full.log
grep -i "opencti" /tmp/backend-full.log
grep -i "tenable" /tmp/backend-full.log
grep -i "rss" /tmp/backend-full.log
```

---

**Arquivo:** `COMANDOS_RAPIDOS.md`  
**Uso:** Referência rápida para deploy e troubleshooting  
**Status:** ✅ Pronto para uso
