# 🚀 Deploy da Integração Tenable no Servidor Ubuntu

## ✅ Commit Realizado

```
Commit: 6240fd8
Mensagem: feat: implementar integração com Tenable.io para buscar vulnerabilidades reais
```

---

## 📋 Passo a Passo para Deploy

### 1️⃣ Transferir Código para o Servidor

**Opção A: Se você tiver remote configurado**

```powershell
# No Windows (se configurar remote)
git remote add origin <URL_DO_SEU_REPOSITORIO>
git push origin master
```

**Opção B: Transferir via SCP/SFTP (Recomendado)**

```powershell
# No Windows, comprimir projeto
Compress-Archive -Path . -DestinationPath painel-update.zip

# Transferir para servidor (ajuste IP e caminho)
scp painel-update.zip usuario@SEU_IP:/tmp/

# No servidor Ubuntu (via SSH)
cd /opt/painel
sudo cp -r . ../painel-backup-$(date +%Y%m%d-%H%M%S)  # Backup
cd /tmp
unzip -o painel-update.zip -d /opt/painel/
cd /opt/painel
```

**Opção C: Clone Fresh (se tiver repositório)**

```bash
# No servidor Ubuntu
cd /opt
sudo mv painel painel-backup-$(date +%Y%m%d-%H%M%S)
git clone <URL_DO_SEU_REPO> painel
cd painel
```

---

### 2️⃣ Rebuild do Backend (Novo serviço Tenable)

```bash
cd /opt/painel

# Rebuild APENAS do backend (tem código novo)
docker compose build backend --no-cache

# Verificar imagem criada
docker images | grep painel-backend
```

---

### 3️⃣ Restart dos Containers

```bash
# Parar containers atuais
docker compose down

# Subir novamente
docker compose up -d

# Verificar status
docker compose ps
```

Todos os containers devem estar **Up (healthy)**:
- ✅ painel-postgres (healthy)
- ✅ painel-backend (healthy)
- ✅ painel-frontend (healthy)

---

### 4️⃣ Verificar Logs

```bash
# Logs do backend (procurar por erros)
docker compose logs backend

# Deve conter:
# ✓ Database connected successfully
# ✓ Database tables initialized
# ✓ Server running on port 3001

# Logs em tempo real
docker compose logs -f backend
```

---

### 5️⃣ Testar API do Dashboard

```bash
# Testar endpoint
curl http://localhost:3001/api/dashboard

# Deve retornar JSON com estrutura:
# {
#   "elastic": [],
#   "defender": [],
#   "opencti": [],
#   "tenable": [],
#   "rss": []
# }
```

---

### 6️⃣ Configurar Chaves do Tenable

1. Acesse: `http://SEU_IP/settings`

2. Na seção **Tenable.io**, preencha:
   - **Access Key:** (sua chave de acesso)
   - **Secret Key:** (sua chave secreta)

3. Clique em **Salvar Configurações**

4. Verifique no banco:

```bash
docker compose exec postgres psql -U admin -d soc_dashboard

SELECT service_name, config_data FROM api_settings WHERE service_name = 'tenable';

# Deve mostrar:
#  service_name |                       config_data                        
# --------------+----------------------------------------------------------
#  tenable      | {"accessKey": "...", "secretKey": "..."}

\q
```

---

### 7️⃣ Testar Integração Tenable

```bash
# Ver logs do backend ao fazer requisição
docker compose logs -f backend &

# Em outro terminal, chamar API
curl http://localhost:3001/api/dashboard

# Logs devem mostrar:
# Fetching vulnerabilities from Tenable...
# Fetched X vulnerabilities from Tenable
```

Se der erro:
```bash
# Ver logs completos
docker compose logs backend | grep -i tenable
docker compose logs backend | grep -i error
```

---

### 8️⃣ Verificar Dashboard no Browser

1. Acesse: `http://SEU_IP/`

2. O card **Tenable.io Vulnerabilities** deve mostrar:
   - ✅ Vulnerabilidades reais da sua conta
   - ✅ Severidade (Critical, High)
   - ✅ Título e descrição
   - ✅ Timestamp

3. Dashboard atualiza automaticamente a cada 30 segundos

---

## 🔍 Troubleshooting

### Problema: "401 Unauthorized" do Tenable

**Solução:**
1. Verificar chaves no Tenable.io: https://cloud.tenable.com/
2. Regenerar chaves se necessário
3. Atualizar nas configurações do painel

### Problema: "Network Error" ou Timeout

**Solução:**
```bash
# Testar conectividade do container
docker compose exec backend sh

# Dentro do container, testar curl
apk add curl
curl -v https://cloud.tenable.com/

# Verificar DNS
nslookup cloud.tenable.com

exit
```

### Problema: Dashboard não mostra vulnerabilidades

**Debug:**

1. **Verificar configurações:**
   ```bash
   docker compose exec postgres psql -U admin -d soc_dashboard \
     -c "SELECT * FROM api_settings WHERE service_name='tenable';"
   ```

2. **Verificar logs do backend:**
   ```bash
   docker compose logs backend | grep -i tenable
   ```

3. **Testar API diretamente:**
   ```bash
   curl http://localhost:3001/api/dashboard | jq .tenable
   ```

4. **Ver resposta completa do Tenable:**
   ```bash
   docker compose logs backend --tail 100 | grep -A 20 "Tenable"
   ```

### Problema: Container backend não sobe

**Solução:**
```bash
# Ver logs de erro
docker compose logs backend

# Verificar variáveis de ambiente
docker compose exec backend env | grep -E 'DB|PORT'

# Rebuild forçando nova imagem
docker compose build backend --no-cache --pull
docker compose up -d backend

# Ver logs em tempo real
docker compose logs -f backend
```

---

## 📊 Estrutura de Resposta da API

### Endpoint: `GET /api/dashboard`

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

- [ ] Código transferido para `/opt/painel` no servidor
- [ ] Backend rebuilded: `docker compose build backend --no-cache`
- [ ] Containers restartados: `docker compose down && docker compose up -d`
- [ ] Todos containers healthy: `docker compose ps`
- [ ] Logs sem erros: `docker compose logs backend`
- [ ] API responde: `curl http://localhost:3001/api/dashboard`
- [ ] Chaves Tenable configuradas em `/settings`
- [ ] Configurações salvas no banco: `SELECT * FROM api_settings`
- [ ] Dashboard mostra vulnerabilidades: acesso via browser
- [ ] Logs mostram "Fetched X vulnerabilities from Tenable"

---

## 🎯 Resultado Esperado

### Antes:
- ❌ Dashboard vazio
- ❌ Card Tenable sem dados
- ❌ Mock data sendo exibido

### Depois:
- ✅ Dashboard com vulnerabilidades reais
- ✅ Card Tenable populado
- ✅ Atualização automática (30s)
- ✅ Dados reais da sua conta Tenable.io
- ✅ Configurações persistidas no banco

---

## 📝 Comandos Rápidos

```bash
# SSH no servidor
ssh usuario@SEU_IP

# Navegar para projeto
cd /opt/painel

# Pull (se tiver git)
git pull origin master

# Rebuild backend
docker compose build backend --no-cache

# Restart tudo
docker compose down && docker compose up -d

# Ver logs
docker compose logs -f backend

# Testar API
curl http://localhost:3001/api/dashboard | jq

# Ver banco
docker compose exec postgres psql -U admin -d soc_dashboard \
  -c "SELECT * FROM api_settings;"
```

---

## 🔐 Segurança

**IMPORTANTE:** As chaves do Tenable são armazenadas em **texto puro** no banco para este MVP. Para produção, considere:

1. Usar variáveis de ambiente (`.env`)
2. Criptografar dados sensíveis no banco
3. Usar secrets management (HashiCorp Vault, AWS Secrets Manager)

---

## 📞 Suporte

Se encontrar erros durante o deploy:

1. Salvar logs completos:
   ```bash
   docker compose logs > /tmp/deploy-logs.txt
   ```

2. Verificar estado dos containers:
   ```bash
   docker compose ps > /tmp/containers-status.txt
   ```

3. Exportar dados do banco:
   ```bash
   docker compose exec postgres pg_dump -U admin soc_dashboard > /tmp/db-backup.sql
   ```

---

**Status:** ✅ Código commitado localmente  
**Próxima ação:** Transferir para servidor e executar deploy
