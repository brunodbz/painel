# 🎯 IMPLEMENTAÇÃO - Integração com Tenable.io

## ✅ O Que Foi Implementado

### 1. Serviço do Tenable
**Arquivo:** `backend/src/services/tenable.ts`

Busca vulnerabilidades reais da API do Tenable.io usando as chaves configuradas.

**Recursos:**
- ✅ Autenticação com accessKey e secretKey
- ✅ Filtro por severidade (critical, high)
- ✅ Conversão de severidade numérica para texto
- ✅ Limitação de resultados
- ✅ Tratamento de erros

### 2. Endpoint Dashboard Atualizado
**Arquivo:** `backend/src/server.ts`

O endpoint `/api/dashboard` agora:
- ✅ Busca configurações salvas no banco
- ✅ Conecta com Tenable.io se configurado
- ✅ Retorna vulnerabilidades reais
- ✅ Logs de debug

---

## 🚀 Como Fazer Deploy

### Passo 1: Commitar (Windows)

```powershell
git add .
git commit -m "feat: implementar integracao com Tenable.io"
git push origin master
```

### Passo 2: Deploy no Servidor (Ubuntu SSH)

```bash
# Navegar para o projeto
cd /opt/painel

# Pull das alterações
git pull origin master

# Rebuild do backend (novo arquivo de serviço)
docker compose build backend --no-cache

# Restart
docker compose down
docker compose up -d

# Ver logs
docker compose logs -f backend
```

### O que procurar nos logs:

```
✓ Database connected successfully
✓ Database tables initialized
✓ Server running on port 3001

# Quando dashboard for acessado:
✓ Fetched 10 vulnerabilities from Tenable
```

---

## 🔍 Como Testar

### 1. Salvar Configurações do Tenable

Acesse: `http://SEU_IP/settings`

Preencha:
- **Access Key:** Sua chave de acesso do Tenable.io
- **Secret Key:** Sua chave secreta do Tenable.io

Clique em "Salvar Configurações"

### 2. Ver no Banco

```bash
docker compose exec postgres psql -U admin -d soc_dashboard

SELECT service_name, config_data FROM api_settings WHERE service_name = 'tenable';

\q
```

### 3. Testar API do Dashboard

```bash
curl http://localhost:3001/api/dashboard
```

Deve retornar algo como:
```json
{
  "elastic": [],
  "defender": [],
  "opencti": [],
  "tenable": [
    {
      "id": "tenable-12345",
      "source": "Tenable",
      "severity": "critical",
      "title": "Apache Log4j Remote Code Execution",
      "description": "Host: server-01 | Plugin ID: 12345",
      "timestamp": "2026-02-04T..."
    },
    ...
  ],
  "rss": []
}
```

### 4. Ver no Dashboard (Browser)

1. Acesse: `http://SEU_IP/`
2. O card "Tenable.io Vulnerabilities" deve mostrar as vulnerabilidades
3. Atualiza automaticamente a cada 30 segundos

---

## 📊 Como Funciona

```
Frontend (usePolling)
    ↓ (a cada 30s)
GET /api/dashboard
    ↓
Backend busca configs do banco
    ↓
Se Tenable configurado:
    ↓
Chama API Tenable.io
    ↓
https://cloud.tenable.com/workbenches/vulnerabilities
    ↓
Converte para formato padronizado
    ↓
Retorna para frontend
    ↓
Frontend renderiza cards
```

---

## 🔧 Troubleshooting

### Erro: "401 Unauthorized" do Tenable

**Causa:** Chaves inválidas ou expiradas

**Solução:**
1. Verificar chaves no Tenable.io
2. Regenerar se necessário
3. Atualizar nas configurações

### Erro: "Network Error" ou Timeout

**Causa:** Servidor não consegue acessar API do Tenable

**Solução:**
1. Verificar firewall do servidor
2. Testar conectividade:
   ```bash
   curl -H "X-ApiKeys: accessKey=YOUR_KEY; secretKey=YOUR_SECRET" \
        https://cloud.tenable.com/workbenches/vulnerabilities
   ```

### Dashboard Não Mostra Vulnerabilidades

**Verificar:**

1. **Configurações salvas:**
   ```bash
   docker compose exec postgres psql -U admin -d soc_dashboard \
     -c "SELECT * FROM api_settings WHERE service_name='tenable';"
   ```

2. **Logs do backend:**
   ```bash
   docker compose logs backend | grep -i tenable
   ```

3. **Resposta da API:**
   ```bash
   curl http://localhost:3001/api/dashboard | jq .tenable
   ```

---

## 🎯 Próximas Integrações

Você pode seguir o mesmo padrão para outras APIs:

### Elastic Search

```typescript
// backend/src/services/elastic.ts
export class ElasticService {
  async getAlerts(config: ElasticConfig) {
    // Implementar busca de alertas
  }
}
```

### Microsoft Defender

```typescript
// backend/src/services/defender.ts
export class DefenderService {
  async getAlerts(config: DefenderConfig) {
    // Implementar busca de alertas
  }
}
```

### OpenCTI

```typescript
// backend/src/services/opencti.ts
export class OpenCTIService {
  async getThreats(config: OpenCTIConfig) {
    // Implementar busca de ameaças
  }
}
```

### RSS Feeds

```typescript
// backend/src/services/rss.ts
export class RSSService {
  async getNews(feeds: string[]) {
    // Implementar parser de RSS
  }
}
```

---

## 📝 Exemplo de Resposta do Tenable

```json
{
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
  ]
}
```

---

## ✅ Checklist

- [ ] Código commitado
- [ ] Backend rebuilded no servidor
- [ ] Chaves do Tenable configuradas
- [ ] Configurações salvas no banco
- [ ] API do dashboard retorna dados
- [ ] Dashboard mostra vulnerabilidades
- [ ] Logs mostram sucesso

---

## 🎉 Resultado Esperado

Antes:
- ❌ Dashboard vazio
- ❌ Card do Tenable sem dados

Depois:
- ✅ Dashboard com vulnerabilidades reais
- ✅ Card do Tenable populado
- ✅ Atualização automática a cada 30s
- ✅ Dados reais da sua conta Tenable.io

---

**Status:** ✅ Integração Tenable implementada  
**Próxima ação:** Deploy e teste com suas chaves reais
