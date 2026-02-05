# 📚 Guia Completo de Configuração das APIs Externas

## 🎯 Visão Geral

O painel SOC Dashboard suporta integração com 5 fontes de dados externas:

1. **Elasticsearch** - Alertas de segurança e eventos SIEM
2. **Microsoft Defender** - Alertas de endpoint e ameaças
3. **OpenCTI** - Inteligência de ameaças cibernéticas
4. **Tenable.io** - Vulnerabilidades de segurança
5. **RSS Feeds** - Notícias e advisories de segurança

Todas as integrações são **opcionais**. Configure apenas as que você usar.

---

## 1️⃣ Elasticsearch

### 📋 Pré-requisitos

- Elasticsearch 7.x ou superior
- Acesso à API REST
- Credenciais (usuário/senha ou API Key)
- URL do cluster

### 🔑 Como Obter Credenciais

#### Opção A: Usuário e Senha

```bash
# Criar usuário com permissões de leitura
curl -X POST "https://your-elastic-cluster:9200/_security/user/soc_dashboard" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "sua_senha_segura",
    "roles": ["viewer"],
    "full_name": "SOC Dashboard",
    "email": "soc@company.com"
  }'
```

#### Opção B: API Key (Recomendado)

```bash
# Criar API Key
curl -X POST "https://your-elastic-cluster:9200/_security/api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "soc-dashboard-key",
    "role_descriptors": {
      "logs-reader": {
        "cluster": ["monitor"],
        "index": [
          {
            "names": ["logs-*", "winlogbeat-*", "filebeat-*"],
            "privileges": ["read", "view_index_metadata"]
          }
        ]
      }
    }
  }'

# Resposta:
# {
#   "id": "VuaCfGcBCdbkQm-e5aOx",
#   "name": "soc-dashboard-key",
#   "api_key": "ui2lp2axTNmsyakw9tvNnw"
# }
```

### ⚙️ Configuração no Painel

Acesse: `http://SEU_IP/settings`

**Campos:**
- **Elasticsearch URL:** `https://your-elastic-cluster:9200`
- **Username:** `soc_dashboard` (se usar usuário/senha)
- **Password:** `sua_senha` (se usar usuário/senha)
- **API Key:** `VuaCfGcBCdbkQm-e5aOx:ui2lp2axTNmsyakw9tvNnw` (se usar API key)
- **Index Pattern:** `logs-*` (opcional, padrão: `logs-*`)

### 🧪 Testar Conexão

```bash
# Com usuário/senha
curl -u "soc_dashboard:sua_senha" \
  "https://your-elastic-cluster:9200/logs-*/_search?size=1"

# Com API Key
curl -H "Authorization: ApiKey VuaCfGcBCdbkQm-e5aOx:ui2lp2axTNmsyakw9tvNnw" \
  "https://your-elastic-cluster:9200/logs-*/_search?size=1"
```

**Resposta esperada:** JSON com hits

### 📊 Dados Buscados

O serviço busca:
- Eventos dos últimos 7 dias
- Categorias: `intrusion_detection`, `malware`
- Ações: `blocked`
- Logs com campo `rule.name` (alertas de regras)

### 🔍 Filtros Aplicados

**Query Elasticsearch:**
```json
{
  "size": 10,
  "sort": [{ "@timestamp": "desc" }],
  "query": {
    "bool": {
      "must": [
        { "range": { "@timestamp": { "gte": "now-7d" } } }
      ],
      "should": [
        { "match": { "event.category": "intrusion_detection" } },
        { "match": { "event.category": "malware" } },
        { "match": { "event.action": "blocked" } },
        { "exists": { "field": "rule.name" } }
      ],
      "minimum_should_match": 1
    }
  }
}
```

### ❌ Troubleshooting

**Erro: 401 Unauthorized**
- Verificar credenciais
- Confirmar que usuário/API key não expirou

**Erro: 403 Forbidden**
- Verificar permissões do usuário
- Usuário precisa de role `viewer` ou permissões de leitura nos índices

**Erro: Timeout**
- Cluster Elasticsearch inacessível
- Verificar firewall e conectividade

---

## 2️⃣ Microsoft Defender for Endpoint

### 📋 Pré-requisitos

- Microsoft 365 E5 ou licença equivalente
- Acesso ao Microsoft 365 Defender Portal
- Permissões de administrador do Azure AD

### 🔑 Como Obter Credenciais

#### Passo 1: Registrar Aplicação no Azure AD

1. Acesse: https://portal.azure.com/
2. Vá em **Azure Active Directory** → **App registrations**
3. Clique em **New registration**

**Configurações:**
- **Name:** `SOC Dashboard Integration`
- **Supported account types:** `Accounts in this organizational directory only`
- **Redirect URI:** (deixar vazio)

4. Clique em **Register**

#### Passo 2: Configurar Permissões

1. Na aplicação criada, vá em **API permissions**
2. Clique em **Add a permission**
3. Selecione **APIs my organization uses**
4. Procure por `WindowsDefenderATP`
5. Selecione **Application permissions**
6. Marque as permissões:
   - `Alert.Read.All`
   - `Machine.Read.All`
7. Clique em **Add permissions**
8. Clique em **Grant admin consent for [Tenant]**

#### Passo 3: Criar Client Secret

1. Vá em **Certificates & secrets**
2. Clique em **New client secret**
3. **Description:** `SOC Dashboard Secret`
4. **Expires:** `24 months`
5. Clique em **Add**
6. **COPIE O VALOR IMEDIATAMENTE** (só aparece uma vez)

#### Passo 4: Coletar IDs

Na página **Overview** da aplicação, copie:
- **Application (client) ID:** `12345678-1234-1234-1234-123456789abc`
- **Directory (tenant) ID:** `87654321-4321-4321-4321-cba987654321`

### ⚙️ Configuração no Painel

Acesse: `http://SEU_IP/settings`

**Campos:**
- **Tenant ID:** `87654321-4321-4321-4321-cba987654321`
- **Client ID:** `12345678-1234-1234-1234-123456789abc`
- **Client Secret:** `ABC~123DEF456GHI789JKL012MNO345PQR678`

### 🧪 Testar Conexão

```bash
# Obter token
TOKEN=$(curl -X POST "https://login.microsoftonline.com/TENANT_ID/oauth2/v2.0/token" \
  -d "client_id=CLIENT_ID" \
  -d "client_secret=CLIENT_SECRET" \
  -d "scope=https://api.securitycenter.microsoft.com/.default" \
  -d "grant_type=client_credentials" \
  | jq -r '.access_token')

# Buscar alertas
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.securitycenter.microsoft.com/api/alerts?$top=1"
```

**Resposta esperada:** JSON com array `value`

### 📊 Dados Buscados

O serviço busca:
- Alertas não resolvidos (`status ne 'Resolved'`)
- Criados nos últimos 7 dias
- Severidade: High e Medium
- Ordenados por data de criação (mais recentes primeiro)

### ❌ Troubleshooting

**Erro: Invalid client secret**
- Secret expirou ou foi regenerado
- Criar novo secret

**Erro: Insufficient privileges**
- Permissões não foram concedidas
- Verificar "Grant admin consent"

**Erro: Resource not found**
- Tenant ID incorreto
- Verificar no Azure AD

---

## 3️⃣ OpenCTI (Open Cyber Threat Intelligence)

### 📋 Pré-requisitos

- Instância do OpenCTI 5.x ou superior
- Acesso à interface web
- Conta de usuário

### 🔑 Como Obter API Key

#### Via Interface Web

1. Acesse: `https://your-opencti-instance.com/`
2. Login com suas credenciais
3. Clique no seu perfil (canto superior direito)
4. Vá em **Profile** → **API access**
5. Clique em **Create token**

**Configurações:**
- **Name:** `SOC Dashboard`
- **Duration:** `1 year`

6. Clique em **Create**
7. **COPIE O TOKEN IMEDIATAMENTE**

Exemplo: `abcd1234-ef56-7890-gh12-ijkl3456mnop`

#### Via API

```bash
# Obter token (requer autenticação inicial)
curl -X POST "https://your-opencti-instance.com/graphql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation { tokenCreate(input: { name: \"SOC Dashboard\" }) { token } }"
  }'
```

### ⚙️ Configuração no Painel

Acesse: `http://SEU_IP/settings`

**Campos:**
- **OpenCTI URL:** `https://your-opencti-instance.com`
- **API Token:** `abcd1234-ef56-7890-gh12-ijkl3456mnop`

### 🧪 Testar Conexão

```bash
curl -X POST "https://your-opencti-instance.com/graphql" \
  -H "Authorization: Bearer abcd1234-ef56-7890-gh12-ijkl3456mnop" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { me { name email } }"
  }'
```

**Resposta esperada:** JSON com dados do usuário

### 📊 Dados Buscados

O serviço busca via GraphQL:
- **Indicadores** (`indicators`)
- **Tipos:** `malicious-activity`, `anomalous-activity`
- **Score:** >= 50 (confiança/severidade)
- **Ordenação:** Por data de criação (mais recentes)
- **Limite:** 10 itens

### 🔍 Query GraphQL Executada

```graphql
query GetIndicators($first: Int!) {
  indicators(
    first: $first,
    orderBy: created,
    orderMode: desc,
    filters: {
      mode: and,
      filters: [
        {
          key: "indicator_types",
          values: ["malicious-activity", "anomalous-activity"],
          operator: eq,
          mode: or
        }
      ]
    }
  ) {
    edges {
      node {
        id
        name
        pattern
        pattern_type
        confidence
        x_opencti_score
        description
        labels { edges { node { value } } }
      }
    }
  }
}
```

### ❌ Troubleshooting

**Erro: Invalid authentication**
- Token expirado ou inválido
- Gerar novo token

**Erro: GraphQL syntax error**
- Versão incompatível do OpenCTI
- Verificar se é versão 5.x ou superior

**Erro: CORS**
- OpenCTI não permite requisições da origem
- Configurar CORS no OpenCTI

---

## 4️⃣ Tenable.io

### 📋 Pré-requisitos

- Conta ativa no Tenable.io
- Licença de scanner (Nessus Pro, Tenable.io, etc.)

### 🔑 Como Obter API Keys

1. Acesse: https://cloud.tenable.com/
2. Login com suas credenciais
3. Clique no seu nome (canto superior direito)
4. Vá em **My Account** → **API Keys**
5. Clique em **Generate** ou **Create**

**Configurações:**
- **Name:** `SOC Dashboard`
- **Enabled:** ✓

6. Clique em **Generate**

Você receberá:
- **Access Key:** `61b9ab917561abb22927aa964b24c5d8cfa5e37fdc5e81540b0c3e36a46e4ae5`
- **Secret Key:** `df3e443cb6debcc3f60a5466afa3b6e7a8fdd81b93b797897592075bb0ade034`

**⚠️ ATENÇÃO:** Secret Key só aparece uma vez. Copie e guarde em local seguro.

### ⚙️ Configuração no Painel

Acesse: `http://SEU_IP/settings`

**Campos:**
- **Access Key:** `61b9ab917561abb22927aa964b24c5d8cfa5e37fdc5e81540b0c3e36a46e4ae5`
- **Secret Key:** `df3e443cb6debcc3f60a5466afa3b6e7a8fdd81b93b797897592075bb0ade034`

### 🧪 Testar Conexão

```bash
curl -H "X-ApiKeys: accessKey=SUA_ACCESS_KEY; secretKey=SUA_SECRET_KEY" \
     -H "Accept: application/json" \
     "https://cloud.tenable.com/workbenches/vulnerabilities"
```

**Resposta esperada:** JSON com array `vulnerabilities`

### 📊 Dados Buscados

O serviço busca:
- Todas as vulnerabilidades
- **Filtro local:** Severidade >= 3 (Critical=4, High=3)
- **Ordenação:** Implícita pela API (mais críticas primeiro)
- **Limite:** 10 itens

### 📝 Formato de Resposta

```json
{
  "vulnerabilities": [
    {
      "plugin_id": 19506,
      "plugin_name": "Apache Log4j RCE",
      "severity": 4,
      "host_name": "server-01",
      "first_found": "2026-01-15T10:30:00Z"
    }
  ]
}
```

### ❌ Troubleshooting

**Erro: 401 Unauthorized**
- Chaves inválidas ou expiradas
- Regenerar chaves no Tenable.io

**Erro: 403 Forbidden**
- Conta sem permissões adequadas
- Verificar licença ativa

**Erro: 429 Too Many Requests**
- Limite de rate limit excedido
- Aguardar 1 minuto e tentar novamente

---

## 5️⃣ RSS Feeds (Notícias de Segurança)

### 📋 Pré-requisitos

Nenhum! RSS é um padrão aberto.

### 🌐 Feeds Recomendados

#### Feeds em Inglês

```
https://feeds.feedburner.com/TheHackersNews
https://www.bleepingcomputer.com/feed/
https://www.schneier.com/blog/atom.xml
https://krebsonsecurity.com/feed/
https://www.darkreading.com/rss.xml
https://threatpost.com/feed/
https://www.cisa.gov/uscert/ncas/current-activity.xml
https://www.us-cert.gov/ncas/alerts.xml
```

#### Feeds em Português

```
https://www.tecmundo.com.br/rss/seguranca.xml
https://canaltech.com.br/rss/seguranca/
https://www.convergenciadigital.com.br/rss/seguranca.xml
```

#### Feeds de Vulnerabilidades (CVE)

```
https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml
https://www.cvedetails.com/vulnerability-feed.php?vendor_id=0&product_id=0&version_id=0&orderby=1&cvssscoremin=7
```

### ⚙️ Configuração no Painel

Acesse: `http://SEU_IP/settings`

**Campo: RSS Feeds (um por linha)**

```
https://feeds.feedburner.com/TheHackersNews
https://www.bleepingcomputer.com/feed/
https://krebsonsecurity.com/feed/
https://www.darkreading.com/rss.xml
https://www.cisa.gov/uscert/ncas/current-activity.xml
```

### 🧪 Testar Feed

```bash
curl -L "https://feeds.feedburner.com/TheHackersNews"
```

**Resposta esperada:** XML com tags `<rss>` ou `<feed>`

### 📊 Dados Buscados

O serviço:
1. Busca todos os feeds configurados **em paralelo**
2. Filtra apenas notícias relacionadas a segurança (palavras-chave)
3. Ordena por data (mais recentes primeiro)
4. Retorna 10 itens

### 🔍 Palavras-chave de Filtro

```typescript
const securityKeywords = [
  'security', 'vulnerability', 'exploit', 'malware', 'ransomware',
  'threat', 'attack', 'breach', 'cve', 'patch', 'advisory',
  'segurança', 'vulnerabilidade', 'ameaça', 'ataque'
];
```

### 🎯 Severidade Auto-detectada

Baseado em palavras-chave no título/conteúdo:

- **Critical:** `zero-day`, `0-day`, `ransomware`, `breach`, `rce`
- **High:** `vulnerability`, `cve-`, `malware`, `attack`, `threat`
- **Medium:** `security`, `patch`, `update`, `advisory`
- **Info:** Outros

### ❌ Troubleshooting

**Erro: Timeout fetching feed**
- Feed está offline ou muito lento
- Remover feed problemático da lista

**Erro: Parse error**
- Feed não é XML válido
- Verificar URL manualmente no browser

**Nenhuma notícia retornada**
- Feeds não têm conteúdo recente de segurança
- Adicionar mais feeds especializados

---

## 🚀 Deploy das Integrações

### 1️⃣ Atualizar Código no Servidor

**Opção A: Via Git (se configurado)**

```bash
cd /opt/painel
git pull origin master
```

**Opção B: Transferir arquivos**

```powershell
# No Windows
cd C:\Users\Bruno\OneDrive\Documentos2\painel
Compress-Archive -Path backend\src\services\* -DestinationPath services-update.zip -Force
scp services-update.zip kryptus@SEU_IP:/tmp/
```

```bash
# No servidor
cd /tmp
unzip -o services-update.zip -d /opt/painel/backend/src/services/
```

### 2️⃣ Rebuild e Restart

```bash
cd /opt/painel

# Rebuild backend (tem código novo)
docker compose build backend --no-cache

# Restart
docker compose down
docker compose up -d

# Verificar logs
docker compose logs backend --tail 50
```

### 3️⃣ Configurar APIs

1. Acesse: `http://SEU_IP/settings`
2. Preencha as credenciais das APIs que você usa
3. Clique em **Salvar Configurações**

### 4️⃣ Validar Funcionamento

```bash
# Testar API
curl http://localhost:3001/api/dashboard | jq

# Ver logs de cada integração
docker compose logs backend | grep -E "Fetched|Error"
```

**Esperado:**
```
✓ Fetched 5 alerts from Elasticsearch
✓ Fetched 3 alerts from Microsoft Defender
✓ Fetched 7 threats from OpenCTI
✓ Fetched 10 vulnerabilities from Tenable
✓ Fetched 8 news from RSS feeds
```

---

## 📊 Exemplo de Resposta da API

```json
{
  "elastic": [
    {
      "id": "elastic-abc123",
      "source": "Elasticsearch",
      "severity": "high",
      "title": "Malware Detection on Host",
      "description": "Host: server-01 | Malware detected",
      "timestamp": "2026-02-04T10:30:00Z"
    }
  ],
  "defender": [
    {
      "id": "defender-def456",
      "source": "Microsoft Defender",
      "severity": "critical",
      "title": "Ransomware Activity Detected",
      "description": "Host: laptop-05 | Ransomware | Blocked",
      "timestamp": "2026-02-04T09:15:00Z"
    }
  ],
  "opencti": [
    {
      "id": "opencti-ghi789",
      "source": "OpenCTI",
      "severity": "high",
      "title": "Malicious IP Address",
      "description": "Type: malicious-activity | Pattern: ipv4-addr | Labels: APT28",
      "timestamp": "2026-02-03T14:20:00Z"
    }
  ],
  "tenable": [
    {
      "id": "tenable-19506",
      "source": "Tenable",
      "severity": "critical",
      "title": "Apache Log4j RCE",
      "description": "Host: web-server-01 | Plugin ID: 19506",
      "timestamp": "2026-01-15T10:30:00Z"
    }
  ],
  "rss": [
    {
      "id": "rss-1738500000-0",
      "source": "RSS Feed",
      "severity": "high",
      "title": "New Zero-Day Exploit in Windows",
      "description": "Microsoft releases emergency patch...",
      "timestamp": "2026-02-04T08:00:00Z",
      "link": "https://example.com/news/123"
    }
  ]
}
```

---

## ✅ Checklist de Configuração

### Elasticsearch
- [ ] Criado usuário ou API key
- [ ] Testado conexão com curl
- [ ] Configurado no painel `/settings`
- [ ] Verificado logs: `docker compose logs backend | grep Elasticsearch`

### Microsoft Defender
- [ ] Registrado app no Azure AD
- [ ] Configurado permissões (Alert.Read.All, Machine.Read.All)
- [ ] Grant admin consent concedido
- [ ] Client secret criado e copiado
- [ ] Tenant ID e Client ID coletados
- [ ] Configurado no painel `/settings`
- [ ] Verificado logs: `docker compose logs backend | grep Defender`

### OpenCTI
- [ ] Criado API token na interface
- [ ] Testado GraphQL query
- [ ] Configurado no painel `/settings`
- [ ] Verificado logs: `docker compose logs backend | grep OpenCTI`

### Tenable
- [ ] Criado API keys no Tenable.io
- [ ] Testado endpoint com curl
- [ ] Configurado no painel `/settings`
- [ ] Verificado logs: `docker compose logs backend | grep Tenable`

### RSS Feeds
- [ ] Selecionado feeds de segurança
- [ ] Testado feeds com curl
- [ ] Configurado no painel `/settings` (um por linha)
- [ ] Verificado logs: `docker compose logs backend | grep RSS`

---

## 🆘 Suporte

Se alguma integração não funcionar:

```bash
# Ver logs completos
docker compose logs backend > /tmp/backend-full.log

# Ver apenas erros
docker compose logs backend | grep -i error

# Testar endpoint específico
curl http://localhost:3001/api/dashboard | jq .SERVICO

# Verificar configurações no banco
docker compose exec postgres psql -U admin -d soc_dashboard \
  -c "SELECT service_name, config_data FROM api_settings;"
```

---

**Autor:** SOC Dashboard Team  
**Data:** 2026-02-04  
**Versão:** 1.0
