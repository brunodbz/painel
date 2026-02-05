# 🚀 Comandos para Deploy da Correção Tenable

## ❌ Problema Identificado

```
Erro: Request failed with status code 400
Causa: Sintaxe inválida do filtro na API do Tenable
```

A API do Tenable não aceita o formato `filter: 'severity:critical,high'` como query parameter. A correção aplica o filtro localmente após buscar os dados.

---

## ✅ Correção Aplicada

**Arquivo:** `backend/src/services/tenable.ts`

**Mudanças:**
- ❌ Removido: `params: { filter: 'severity:critical,high', limit: 10 }`
- ✅ Adicionado: Filtro local por `vuln.severity >= 3` (critical=4, high=3)
- ✅ Melhorado: Tratamento de erros com detalhes da resposta

---

## 📋 Comandos para Executar no Servidor Ubuntu

### 1️⃣ Conectar via SSH

```bash
ssh usuario@SEU_IP
```

### 2️⃣ Navegar para o Projeto

```bash
cd /opt/painel
```

### 3️⃣ Opção A: Pull via Git (Se tiver repositório configurado)

```bash
git pull origin master
```

### 3️⃣ Opção B: Transferir Arquivo Manualmente

**No Windows (PowerShell):**

```powershell
# Copiar apenas o arquivo corrigido
scp C:\Users\Bruno\OneDrive\Documentos2\painel\backend\src\services\tenable.ts usuario@SEU_IP:/opt/painel/backend/src/services/tenable.ts
```

**Ou via arquivo zip:**

```powershell
# Comprimir apenas o backend
Compress-Archive -Path backend\src\services\tenable.ts -DestinationPath tenable-fix.zip -Force

# Enviar para servidor
scp tenable-fix.zip usuario@SEU_IP:/tmp/
```

**No servidor Ubuntu:**

```bash
cd /tmp
unzip -o tenable-fix.zip -d /opt/painel/
```

### 4️⃣ Rebuild do Backend

```bash
cd /opt/painel

# Rebuild apenas o backend
docker compose build backend --no-cache

# Verificar se a imagem foi criada
docker images | grep painel-backend
```

### 5️⃣ Restart dos Containers

```bash
# Parar todos
docker compose down

# Subir novamente
docker compose up -d

# Verificar status
docker compose ps
```

**Resultado esperado:**
```
NAME           IMAGE             STATUS              PORTS
soc_backend    painel-backend    Up (healthy)        0.0.0.0:3001->3001/tcp
soc_frontend   painel-frontend   Up (healthy)        0.0.0.0:80->80/tcp
soc_postgres   postgres:15       Up (healthy)        5432/tcp
```

### 6️⃣ Verificar Logs

```bash
# Ver logs do backend
docker compose logs backend --tail 50

# Deve mostrar:
# ✓ Database connected successfully
# ✓ Server running on port 3001
```

### 7️⃣ Testar API Manualmente

```bash
# Fazer chamada para testar
curl http://localhost:3001/api/dashboard
```

**Se ainda houver erro:**

```bash
# Ver logs em tempo real
docker compose logs -f backend
```

**No browser, acesse:**
```
http://SEU_IP/
```

O dashboard deve carregar e tentar buscar vulnerabilidades do Tenable.

### 8️⃣ Debug (Se Ainda Houver Erro)

#### Verificar Configurações no Banco

```bash
docker compose exec postgres psql -U admin -d soc_dashboard

SELECT service_name, config_data FROM api_settings WHERE service_name = 'tenable';

\q
```

#### Testar Chaves Diretamente

```bash
# Substituir ACCESS_KEY e SECRET_KEY pelas suas chaves
curl -H "X-ApiKeys: accessKey=SUA_ACCESS_KEY; secretKey=SUA_SECRET_KEY" \
     -H "Accept: application/json" \
     https://cloud.tenable.com/workbenches/vulnerabilities
```

**Respostas possíveis:**

- ✅ **200 OK**: Chaves válidas, deve retornar JSON com vulnerabilidades
- ❌ **401 Unauthorized**: Chaves inválidas ou expiradas
- ❌ **403 Forbidden**: Sem permissão para acessar API
- ❌ **400 Bad Request**: (não deve mais ocorrer com a correção)

#### Ver Detalhes do Erro

```bash
docker compose logs backend | grep -A 30 "Erro ao buscar vulnerabilidades do Tenable"
```

---

## 🔍 Troubleshooting

### Erro: 401 Unauthorized

**Causa:** Chaves inválidas

**Solução:**
1. Acesse: https://cloud.tenable.com/
2. Vá em: **Settings** → **API Keys**
3. Gere novas chaves
4. No painel, acesse: `http://SEU_IP/settings`
5. Atualize as chaves
6. Salve

### Erro: Container backend não inicia

```bash
# Ver logs de erro
docker compose logs backend

# Rebuild forçado
docker compose build backend --no-cache --pull
docker compose up -d backend
```

### Erro: "Network Error"

**Causa:** Servidor não consegue acessar internet ou API do Tenable

**Teste de conectividade:**

```bash
# Do servidor Ubuntu
curl -v https://cloud.tenable.com/

# Dentro do container
docker compose exec backend sh
apk add curl
curl -v https://cloud.tenable.com/
exit
```

### Dashboard continua vazio

**Verificações:**

1. **Backend rodando:**
   ```bash
   docker compose ps backend
   # Deve estar "Up (healthy)"
   ```

2. **API responde:**
   ```bash
   curl http://localhost:3001/api/dashboard | jq
   ```

3. **Frontend recebe dados:**
   - Abra o browser em `http://SEU_IP/`
   - Abra DevTools (F12)
   - Aba **Network**
   - Procure por chamadas para `/api/dashboard`
   - Verifique a resposta

---

## 📊 Exemplo de Resposta Correta

### API do Tenable (Cloud):

```json
{
  "vulnerabilities": [
    {
      "plugin_id": 19506,
      "plugin_name": "Apache Log4j < 2.15.0 Remote Code Execution",
      "severity": 4,
      "host_name": "web-server-01",
      "first_found": "2026-01-15T10:30:00Z"
    },
    {
      "plugin_id": 51192,
      "plugin_name": "SSL Certificate Cannot Be Trusted",
      "severity": 3,
      "host_name": "api-server-02",
      "first_found": "2026-01-20T14:22:00Z"
    }
  ]
}
```

### API do Dashboard (Backend transformado):

```json
{
  "elastic": [],
  "defender": [],
  "opencti": [],
  "tenable": [
    {
      "id": "tenable-19506",
      "source": "Tenable",
      "severity": "critical",
      "title": "Apache Log4j < 2.15.0 Remote Code Execution",
      "description": "Host: web-server-01 | Plugin ID: 19506",
      "timestamp": "2026-01-15T10:30:00Z"
    },
    {
      "id": "tenable-51192",
      "source": "Tenable",
      "severity": "high",
      "title": "SSL Certificate Cannot Be Trusted",
      "description": "Host: api-server-02 | Plugin ID: 51192",
      "timestamp": "2026-01-20T14:22:00Z"
    }
  ],
  "rss": []
}
```

---

## ✅ Checklist de Deploy

- [ ] Conectado ao servidor via SSH
- [ ] Código atualizado em `/opt/painel`
- [ ] Backend rebuilded: `docker compose build backend --no-cache`
- [ ] Containers restartados: `docker compose down && docker compose up -d`
- [ ] Todos containers healthy: `docker compose ps`
- [ ] Logs sem erro 400: `docker compose logs backend | grep 400`
- [ ] API responde: `curl http://localhost:3001/api/dashboard`
- [ ] Dashboard carrega no browser: `http://SEU_IP/`
- [ ] Chaves Tenable configuradas em `/settings`
- [ ] Vulnerabilidades aparecem no dashboard

---

## 🎯 Resultado Esperado

### Antes (Erro):
```
❌ Request failed with status code 400
❌ responseUrl: '...?filter=severity:critical,high&limit=10'
❌ Dashboard vazio
```

### Depois (Sucesso):
```
✅ Fetched X vulnerabilities from Tenable
✅ Dashboard mostra vulnerabilidades reais
✅ Atualização automática a cada 30s
✅ Logs limpos sem erro 400
```

---

## 📝 Comandos Resumidos (Copy-Paste)

```bash
# No servidor Ubuntu (executar sequencialmente)
cd /opt/painel
docker compose build backend --no-cache
docker compose down
docker compose up -d
docker compose ps
docker compose logs backend --tail 50
curl http://localhost:3001/api/dashboard | jq .tenable
```

Se tudo estiver OK, acesse o dashboard no browser e verifique se as vulnerabilidades aparecem.

---

## 🆘 Se Ainda Houver Problemas

**Executar no servidor e enviar os resultados:**

```bash
# 1. Status dos containers
docker compose ps > /tmp/status.txt

# 2. Logs completos do backend
docker compose logs backend > /tmp/backend-logs.txt

# 3. Configurações do banco
docker compose exec postgres psql -U admin -d soc_dashboard \
  -c "SELECT * FROM api_settings;" > /tmp/db-config.txt

# 4. Testar API local
curl http://localhost:3001/api/dashboard > /tmp/api-response.json 2>&1

# 5. Ver arquivos criados
cat /tmp/status.txt
cat /tmp/backend-logs.txt
cat /tmp/db-config.txt
cat /tmp/api-response.json
```

Envie os outputs desses comandos para análise.

---

**Status:** ✅ Correção commitada localmente  
**Próxima ação:** Executar deploy no servidor Ubuntu com os comandos acima
