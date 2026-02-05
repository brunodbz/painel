# 🚀 Deploy Rápido - Novas Integrações

## ✅ O Que Foi Implementado

### 4 Novos Serviços de Integração:

1. **ElasticService** (`backend/src/services/elastic.ts`)
   - Busca alertas de segurança via API REST
   - Suporta autenticação via usuário/senha ou API Key
   - Filtra eventos dos últimos 7 dias

2. **DefenderService** (`backend/src/services/defender.ts`)
   - Integra com Microsoft Defender for Endpoint
   - OAuth2 com Azure AD
   - Busca alertas High e Medium não resolvidos

3. **OpenCTIService** (`backend/src/services/opencti.ts`)
   - Busca indicadores de ameaças via GraphQL
   - Filtra por score/confidence >= 50
   - Tipos: malicious-activity, anomalous-activity

4. **RSSService** (`backend/src/services/rss.ts`)
   - Parser de feeds RSS de notícias
   - Filtro automático por palavras-chave de segurança
   - Detecção automática de severidade

### Endpoint /api/dashboard Atualizado:

- ✅ Busca de **todas as APIs em paralelo** (Promise.all)
- ✅ Tratamento de erro individualizado por serviço
- ✅ Logs detalhados de cada integração
- ✅ Retorna arrays vazios se API não configurada ou com erro

---

## 📦 Commit Criado

```
Commit: 2b0be49
Mensagem: feat: implementar integracoes com Elasticsearch, Defender, OpenCTI e RSS
```

**Arquivos:**
- `backend/src/services/elastic.ts` (novo)
- `backend/src/services/defender.ts` (novo)
- `backend/src/services/opencti.ts` (novo)
- `backend/src/services/rss.ts` (novo)
- `backend/src/server.ts` (atualizado)

---

## 🎯 DEPLOY NO SERVIDOR - 3 OPÇÕES

### ⚡ OPÇÃO 1: Script Automatizado

**No Windows PowerShell:**

```powershell
cd C:\Users\Bruno\OneDrive\Documentos2\painel

# Comprimir todos os serviços
Compress-Archive -Path backend\src\services\* -DestinationPath services-all.zip -Force

# Transferir para servidor
scp services-all.zip kryptus@SEU_IP:/tmp/
```

**No Servidor Ubuntu:**

```bash
ssh kryptus@SEU_IP

cd /tmp
unzip -o services-all.zip -d /opt/painel/backend/src/services/

# Atualizar server.ts também
# (ou copiar arquivo completo do Windows)

cd /opt/painel
docker compose build backend --no-cache
docker compose down && docker compose up -d
docker compose logs backend --tail 50
```

---

### 📋 OPÇÃO 2: Via Git (Se Configurado)

```bash
# No servidor
cd /opt/painel
git pull origin master
docker compose build backend --no-cache
docker compose down && docker compose up -d
docker compose logs backend --tail 50
```

---

### ✏️ OPÇÃO 3: Copiar Arquivos Manualmente

**1. Criar os arquivos no servidor:**

```bash
ssh kryptus@SEU_IP
cd /opt/painel/backend/src/services
```

**2. Criar elastic.ts:**

```bash
nano elastic.ts
# Copiar conteúdo de C:\Users\Bruno\OneDrive\Documentos2\painel\backend\src\services\elastic.ts
# Colar no nano
# Salvar: Ctrl+O, Enter, Ctrl+X
```

**3. Criar defender.ts:**

```bash
nano defender.ts
# Copiar conteúdo de defender.ts
# Colar e salvar
```

**4. Criar opencti.ts:**

```bash
nano opencti.ts
# Copiar conteúdo de opencti.ts
# Colar e salvar
```

**5. Criar rss.ts:**

```bash
nano rss.ts
# Copiar conteúdo de rss.ts
# Colar e salvar
```

**6. Atualizar server.ts:**

```bash
cd /opt/painel/backend/src
nano server.ts
# Copiar conteúdo atualizado de server.ts
# Colar e salvar
```

**7. Rebuild:**

```bash
cd /opt/painel
docker compose build backend --no-cache
docker compose down && docker compose up -d
```

---

## ✅ VALIDAÇÃO PÓS-DEPLOY

### 1️⃣ Verificar se Backend Iniciou

```bash
docker compose ps
```

✅ **Esperado:** `soc_backend` com status `Up (healthy)`

### 2️⃣ Verificar Logs de Inicialização

```bash
docker compose logs backend --tail 50
```

✅ **Esperado:**
```
✓ Database connected successfully
✓ Database tables initialized
✓ Server running on port 3001
```

❌ **Se houver erro de build/compilação:** Verificar sintaxe dos arquivos TypeScript

### 3️⃣ Testar Endpoint Dashboard

```bash
curl http://localhost:3001/api/dashboard | jq
```

✅ **Esperado:** JSON com 5 arrays (todos vazios se nada configurado)
```json
{
  "elastic": [],
  "defender": [],
  "opencti": [],
  "tenable": [],
  "rss": []
}
```

### 4️⃣ Configurar APIs no Painel

1. Acesse: `http://SEU_IP/settings`
2. Preencha credenciais das APIs que você usa
3. Clique em **Salvar Configurações**

### 5️⃣ Verificar Logs de Integração

```bash
# Logs em tempo real
docker compose logs -f backend

# Ou ver últimas linhas
docker compose logs backend --tail 100 | grep -E "Fetched|Error"
```

✅ **Esperado (para APIs configuradas):**
```
✓ Fetched 5 alerts from Elasticsearch
✓ Fetched 3 alerts from Microsoft Defender
✓ Fetched 7 threats from OpenCTI
✓ Fetched 10 vulnerabilities from Tenable
✓ Fetched 8 news from RSS feeds
```

❌ **Se houver erro de autenticação:** Verificar credenciais em `/settings`

### 6️⃣ Testar no Browser

1. Acesse: `http://SEU_IP/`
2. Deve mostrar cards para todas as APIs
3. Cards devem popular com dados reais (se configuradas)
4. Dashboard atualiza a cada 30 segundos

---

## 🔧 CONFIGURAÇÃO DAS APIs

### 📚 Documentação Completa

Criei o arquivo **`CONFIGURACAO_APIS.md`** com guia detalhado de:

- ✅ Como obter credenciais de cada API
- ✅ Passo a passo de configuração
- ✅ Comandos de teste de conexão
- ✅ Troubleshooting comum
- ✅ Exemplos de resposta

### 🎯 Resumo Rápido

| API | Credenciais Necessárias |
|-----|-------------------------|
| **Elasticsearch** | URL + (Username/Password ou API Key) |
| **Microsoft Defender** | Tenant ID + Client ID + Client Secret |
| **OpenCTI** | URL + API Token |
| **Tenable** | Access Key + Secret Key |
| **RSS** | URLs dos feeds (um por linha) |

### 🌐 RSS Feeds Recomendados

Copie e cole em `/settings` → **RSS Feeds:**

```
https://feeds.feedburner.com/TheHackersNews
https://www.bleepingcomputer.com/feed/
https://krebsonsecurity.com/feed/
https://www.darkreading.com/rss.xml
https://www.cisa.gov/uscert/ncas/current-activity.xml
```

---

## 🐛 TROUBLESHOOTING

### Container Backend Não Inicia

```bash
# Ver erro completo
docker compose logs backend

# Comum: Erro de sintaxe TypeScript
# Solução: Verificar se todos os arquivos foram copiados corretamente
```

### Erro: "Cannot find module './services/elastic'"

**Causa:** Arquivos não foram copiados ou estão no local errado

**Solução:**
```bash
ls -la /opt/painel/backend/src/services/
# Deve mostrar: elastic.ts, defender.ts, opencti.ts, rss.ts, tenable.ts

# Se faltarem, copiar novamente
```

### API Retorna Array Vazio

**Causa:** API não configurada ou credenciais inválidas

**Verificar configurações:**
```bash
docker compose exec postgres psql -U admin -d soc_dashboard \
  -c "SELECT service_name, config_data FROM api_settings;"
```

**Verificar logs:**
```bash
docker compose logs backend | grep -i "error"
```

### Erro: "Request failed with status code 401"

**Causa:** Credenciais inválidas ou expiradas

**Solução:**
1. Verificar credenciais no painel `/settings`
2. Regenerar credenciais na plataforma da API
3. Atualizar no painel
4. Aguardar próxima atualização do dashboard (30s)

### Defender: "Invalid client secret"

**Causa:** Secret expirou (validade máxima: 24 meses)

**Solução:**
1. Acesse Azure Portal
2. App registrations → Sua app
3. Certificates & secrets → New client secret
4. Copie novo secret
5. Atualize em `/settings`

### OpenCTI: "GraphQL syntax error"

**Causa:** Versão incompatível do OpenCTI

**Solução:**
- Verificar versão: `https://your-opencti.com/` (canto inferior esquerdo)
- Versão mínima: 5.x
- Se < 5.x, atualizar OpenCTI ou ajustar query GraphQL

### RSS: "Timeout fetching feed"

**Causa:** Feed offline ou muito lento

**Solução:**
1. Testar feed manualmente: `curl -L "URL_DO_FEED"`
2. Se timeout, remover feed da lista
3. Adicionar feed alternativo

---

## 📊 ESTRUTURA DE DADOS RETORNADA

### Formato Padronizado (todos os serviços)

```typescript
interface Alert {
  id: string;           // Identificador único
  source: string;       // Nome da fonte (Elasticsearch, Defender, etc.)
  severity: string;     // critical | high | medium | low | info
  title: string;        // Título do alerta/ameaça
  description: string;  // Descrição detalhada
  timestamp: string;    // ISO 8601 timestamp
  link?: string;        // URL (apenas RSS)
}
```

### Exemplo Completo

```json
{
  "elastic": [
    {
      "id": "elastic-abc123",
      "source": "Elasticsearch",
      "severity": "high",
      "title": "Intrusion Detection Alert",
      "description": "Host: server-01 | Malicious activity detected",
      "timestamp": "2026-02-04T10:30:00Z"
    }
  ],
  "defender": [
    {
      "id": "defender-def456",
      "source": "Microsoft Defender",
      "severity": "critical",
      "title": "Ransomware Activity Blocked",
      "description": "Host: laptop-05 | Ransomware | Status: Blocked",
      "timestamp": "2026-02-04T09:15:00Z"
    }
  ],
  "opencti": [
    {
      "id": "opencti-ghi789",
      "source": "OpenCTI",
      "severity": "high",
      "title": "Known Malicious IP",
      "description": "Type: malicious-activity | Pattern: ipv4-addr",
      "timestamp": "2026-02-03T14:20:00Z"
    }
  ],
  "tenable": [
    {
      "id": "tenable-19506",
      "source": "Tenable",
      "severity": "critical",
      "title": "Apache Log4j RCE Vulnerability",
      "description": "Host: web-server-01 | Plugin ID: 19506",
      "timestamp": "2026-01-15T10:30:00Z"
    }
  ],
  "rss": [
    {
      "id": "rss-1738500000-0",
      "source": "RSS Feed",
      "severity": "high",
      "title": "Zero-Day Exploit Found in Windows",
      "description": "Microsoft releases emergency patch for critical vulnerability...",
      "timestamp": "2026-02-04T08:00:00Z",
      "link": "https://example.com/news/article"
    }
  ]
}
```

---

## ✅ CHECKLIST FINAL

### Deploy
- [ ] Código transferido para `/opt/painel`
- [ ] Backend rebuilded: `docker compose build backend --no-cache`
- [ ] Containers restartados: `docker compose up -d`
- [ ] Backend iniciou sem erros: `docker compose logs backend`
- [ ] Endpoint responde: `curl http://localhost:3001/api/dashboard`

### Configuração
- [ ] Acessado painel: `http://SEU_IP/settings`
- [ ] Configurado APIs que você usa
- [ ] Salvo configurações
- [ ] Verificado salvamento no banco: `SELECT * FROM api_settings`

### Validação
- [ ] Dashboard carrega no browser
- [ ] Cards aparecem para todas as APIs
- [ ] Dados populam (se APIs configuradas)
- [ ] Logs mostram "Fetched X items" para cada API
- [ ] Sem erros nos logs: `docker compose logs backend | grep -i error`

---

## 📞 COMANDOS RÁPIDOS

```bash
# Deploy completo (executar sequencialmente)
cd /opt/painel
docker compose build backend --no-cache
docker compose down
docker compose up -d
docker compose ps
docker compose logs backend --tail 50

# Testar API
curl http://localhost:3001/api/dashboard | jq

# Ver logs de integração
docker compose logs backend | grep -E "Fetched|Error"

# Ver configurações
docker compose exec postgres psql -U admin -d soc_dashboard \
  -c "SELECT service_name, is_active FROM api_settings;"

# Restart apenas backend (se necessário)
docker compose restart backend
docker compose logs -f backend
```

---

## 🎯 PRÓXIMOS PASSOS

1. **Deploy no servidor** (escolha uma das 3 opções acima)
2. **Configure as APIs** em `/settings` (consulte `CONFIGURACAO_APIS.md`)
3. **Valide funcionamento** com os comandos de teste
4. **Monitore logs** para identificar problemas de autenticação

---

## 📚 DOCUMENTAÇÃO CRIADA

1. **`CONFIGURACAO_APIS.md`** ⭐ - Guia completo de configuração
   - Como obter credenciais de cada API
   - Passo a passo detalhado
   - Troubleshooting

2. **`DEPLOY_INTEGRACOES.md`** (este arquivo)
   - Deploy rápido das novas integrações
   - Validação pós-deploy
   - Comandos úteis

---

**Status:** ✅ Implementação completa e commitada  
**Commit:** 2b0be49  
**Próxima ação:** Deploy no servidor e configuração das APIs
