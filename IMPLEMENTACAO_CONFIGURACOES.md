# Implementação de Configurações Persistentes

## 📋 O Que Foi Implementado

### Backend (API)

**Arquivo:** `backend/src/server.ts`

#### 1. Banco de Dados
- **Tabela `api_settings`**: Armazena configurações de cada serviço
- **Tabela `settings_audit_log`**: Log de auditoria de todas as alterações
- **Auto-inicialização**: Tabelas criadas automaticamente ao iniciar

#### 2. Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/settings` | Salva configurações de todos os serviços |
| `GET` | `/api/settings` | Busca todas as configurações |
| `GET` | `/api/settings/:service` | Busca configuração de um serviço específico |
| `DELETE` | `/api/settings/:service` | Remove configuração de um serviço |

#### 3. Estrutura de Dados

```json
{
  "elastic": {
    "url": "https://elastic.internal:9200",
    "apiKey": "****"
  },
  "defender": {
    "tenantId": "...",
    "clientId": "...",
    "clientSecret": "****"
  },
  "opencti": {
    "url": "...",
    "token": "****"
  },
  "tenable": {
    "accessKey": "...",
    "secretKey": "****"
  },
  "rss": {
    "feeds": ["url1", "url2"]
  }
}
```

### Frontend (React)

**Arquivo:** `src/pages/Settings.tsx`

#### 1. Funcionalidades Implementadas

- ✅ **Carregamento automático**: Busca configurações salvas ao abrir a página
- ✅ **Salvamento real**: POST para `/api/settings`
- ✅ **Feedback visual**: Mensagens de sucesso/erro
- ✅ **Loading state**: Indicador de carregamento
- ✅ **Reset**: Botão para resetar formulário

#### 2. UX Melhorada

- Estado de loading com spinner
- Mensagens de sucesso (verde) e erro (vermelho)
- Auto-hide de mensagens após 5 segundos
- Botão de reset para limpar campos

---

## 🚀 Como Testar

### 1. Rebuild do Backend

Como o código do backend mudou, é necessário rebuild:

```bash
# Parar containers
docker compose down

# Rebuild do backend
docker compose build backend

# Iniciar novamente
docker compose up -d

# Ver logs para confirmar
docker compose logs -f backend
```

Você deve ver:
```
✓ Database connected successfully
✓ Database tables initialized
✓ Server running on port 3001
```

### 2. Testar Salvamento

1. Acesse `http://localhost/settings`
2. Preencha qualquer campo (por exemplo, Elastic URL)
3. Clique em "Salvar Configurações"
4. Deve aparecer: **"Configurações salvas com sucesso!"** (verde)

### 3. Testar Persistência

1. Recarregue a página (F5)
2. Os campos devem estar preenchidos com os valores salvos
3. Isso confirma que os dados estão no banco

### 4. Verificar no Banco de Dados

```bash
# Entrar no container do PostgreSQL
docker compose exec postgres psql -U admin -d soc_dashboard

# Ver configurações salvas
SELECT service_name, config_data, updated_at FROM api_settings;

# Ver log de auditoria
SELECT * FROM settings_audit_log ORDER BY timestamp DESC LIMIT 5;

# Sair
\q
```

### 5. Testar API Diretamente

```bash
# Salvar configuração
curl -X POST http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "elasticUrl": "https://elastic.test:9200",
    "elasticKey": "test-key-123"
  }'

# Buscar configurações
curl http://localhost:3001/api/settings

# Buscar configuração específica
curl http://localhost:3001/api/settings/elastic
```

---

## 📊 Estrutura do Banco de Dados

### Tabela `api_settings`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL | ID auto-incremento |
| `service_name` | VARCHAR(50) | Nome do serviço (elastic, defender, etc) |
| `config_data` | JSONB | Dados de configuração em JSON |
| `is_active` | BOOLEAN | Se a configuração está ativa |
| `created_at` | TIMESTAMP | Data de criação |
| `updated_at` | TIMESTAMP | Data da última atualização |

### Tabela `settings_audit_log`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL | ID auto-incremento |
| `service_name` | VARCHAR(50) | Serviço alterado |
| `action` | VARCHAR(20) | Ação (UPDATE, DELETE) |
| `changed_by` | VARCHAR(100) | Usuário (futuro) |
| `old_data` | JSONB | Dados antigos |
| `new_data` | JSONB | Dados novos |
| `timestamp` | TIMESTAMP | Data da alteração |

---

## 🔒 Segurança

### Implementado

1. ✅ **CORS**: Apenas origens configuradas podem acessar
2. ✅ **Helmet.js**: Headers de segurança HTTP
3. ✅ **Transações**: Uso de BEGIN/COMMIT para atomicidade
4. ✅ **Auditoria**: Log de todas as alterações
5. ✅ **Validação**: Checks básicos de dados

### Recomendações Futuras

- [ ] Criptografar senhas/tokens no banco (usar pgcrypto)
- [ ] Autenticação de usuário
- [ ] Rate limiting
- [ ] Validação de URL/formato de dados
- [ ] Backup automático da tabela de configurações

---

## 🎯 Próximos Passos

### 1. Usar Configurações no Dashboard

Agora que as configurações são salvas, você pode:

```typescript
// Buscar config do Elastic para usar na integração
const response = await fetch('/api/settings/elastic');
const { data } = await response.json();

// Usar nas chamadas
const elasticClient = new ElasticClient(data.url, data.apiKey);
```

### 2. Implementar Integrações Reais

Com as configurações salvas, implemente:
- Conexão com Elastic Search
- Autenticação com Microsoft Defender
- Integração com OpenCTI
- Scan com Tenable
- Leitura de RSS Feeds

### 3. Dashboard em Tempo Real

Use as configurações para:
- Buscar dados reais das APIs
- Substituir mock data
- Mostrar estatísticas reais

---

## 🐛 Troubleshooting

### Erro: "Cannot connect to backend"

```bash
# Verificar se backend está rodando
docker compose ps backend

# Ver logs
docker compose logs backend
```

### Erro: "Database connection failed"

```bash
# Verificar PostgreSQL
docker compose ps postgres

# Ver logs do banco
docker compose logs postgres
```

### Tabelas não foram criadas

```bash
# Recriar manualmente
docker compose exec postgres psql -U admin -d soc_dashboard -f /app/src/database/schema.sql
```

### Frontend não carrega configurações

1. Abra DevTools (F12)
2. Vá em Network
3. Recarregue a página
4. Veja se `/api/settings` retorna 200 OK

---

## 📝 Arquivos Criados/Modificados

### Novos Arquivos
- `backend/src/database/schema.sql` - Schema do banco de dados

### Arquivos Modificados
- `backend/src/server.ts` - Adicionado endpoints de configuração
- `src/pages/Settings.tsx` - Integrado com API real

---

## ✅ Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] Testar localmente todas as funcionalidades
- [ ] Verificar se configurações são salvas corretamente
- [ ] Verificar se configurações são carregadas ao reabrir
- [ ] Testar reset de formulário
- [ ] Verificar mensagens de erro
- [ ] Rebuild do backend no servidor
- [ ] Verificar logs do servidor
- [ ] Testar no ambiente de produção

---

**Documentação criada em:** 2026-02-04
**Versão:** 1.0.0
**Status:** ✅ Implementação Completa
