# 🛡️ Painel SOC Dashboard

Dashboard de Segurança da Informação com integrações para múltiplas fontes de dados de segurança cibernética.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📊 Visão Geral

Painel centralizado para monitoramento de eventos de segurança, vulnerabilidades e inteligência de ameaças em tempo real.

### 🎯 Funcionalidades

- ✅ **Dashboard em Tempo Real** - Atualização automática a cada 30 segundos
- ✅ **5 Integrações de Segurança** - Dados de múltiplas fontes consolidados
- ✅ **Filtros de Severidade** - Critical, High, Medium, Low, Info
- ✅ **Configuração Web** - Interface de configuração amigável
- ✅ **Persistência de Dados** - PostgreSQL para configurações
- ✅ **Docker** - Deploy simplificado com Docker Compose
- ✅ **APIs RESTful** - Backend Node.js/Express
- ✅ **Interface Moderna** - Frontend React + Vite + TypeScript

---

## 🔌 Integrações Suportadas

### 1. Elasticsearch
- Alertas de SIEM e eventos de segurança
- Suporte a múltiplos índices
- Autenticação via API Key ou usuário/senha

### 2. Microsoft Defender for Endpoint
- Alertas de endpoints
- Integração via Microsoft Graph API
- OAuth2 com Azure AD

### 3. OpenCTI (Open Cyber Threat Intelligence)
- Indicadores de ameaças cibernéticas
- Query GraphQL
- Score de confiança automático

### 4. Tenable.io
- Vulnerabilidades de segurança
- Integração com scanner Nessus
- Filtro por severidade crítica/alta

### 5. RSS Feeds
- Notícias de segurança
- Múltiplos feeds simultâneos
- Detecção automática de severidade

---

## 🚀 Quick Start

### Pré-requisitos

- Docker e Docker Compose
- Git (opcional)

### Deploy com Docker Compose

```bash
# Clone o repositório
git clone <URL_DO_REPO>
cd painel

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar containers
docker compose up -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f backend
```

Acesse: `http://localhost/`

### Configuração Inicial

1. Acesse: `http://localhost/settings`
2. Configure as credenciais das APIs que você usa
3. Salve as configurações
4. Dashboard populará automaticamente

---

## 📚 Documentação Completa

### 🎯 Comece Aqui

- **[INDICE.md](INDICE.md)** - Índice completo da documentação
- **[RESUMO_IMPLEMENTACAO.md](RESUMO_IMPLEMENTACAO.md)** - Visão geral do projeto
- **[COMANDOS_RAPIDOS.md](COMANDOS_RAPIDOS.md)** - Deploy rápido

### 📖 Guias Detalhados

- **[CONFIGURACAO_APIS.md](CONFIGURACAO_APIS.md)** ⭐ - Como configurar cada API
- **[DEPLOY_INTEGRACOES.md](DEPLOY_INTEGRACOES.md)** - Deploy das integrações
- **[DEPLOY_NO_SERVIDOR.md](DEPLOY_NO_SERVIDOR.md)** - Deploy em servidor Ubuntu
- **[INSTALACAO_UBUNTU.md](INSTALACAO_UBUNTU.md)** - Instalação e configuração padrão (Ubuntu)

### 🐛 Troubleshooting

- **[COMANDOS_RAPIDOS.md](COMANDOS_RAPIDOS.md)** - Seção Troubleshooting
- **[RESUMO_CORRECAO.md](RESUMO_CORRECAO.md)** - Correção erro 400 Tenable

---

## 🛠️ Stack Tecnológica

### Backend
- **Node.js 20+** - Runtime
- **TypeScript** - Linguagem
- **Express** - Framework web
- **PostgreSQL** - Banco de dados
- **Axios** - Cliente HTTP
- **RSS Parser** - Parser de feeds

### Frontend
- **React 18** - UI Framework
- **TypeScript** - Linguagem
- **Vite** - Build tool
- **Tailwind CSS** - Estilização
- **React Router** - Roteamento

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **Nginx** - Servidor web (frontend)

---

## 📁 Estrutura do Projeto

```
painel/
├── backend/
│   ├── src/
│   │   ├── services/          # Integrações com APIs externas
│   │   │   ├── elastic.ts
│   │   │   ├── defender.ts
│   │   │   ├── opencti.ts
│   │   │   ├── tenable.ts
│   │   │   └── rss.ts
│   │   └── server.ts          # API REST endpoints
│   ├── package.json
│   └── Dockerfile
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx      # Página principal
│   │   └── Settings.tsx       # Configurações
│   ├── hooks/
│   │   └── usePolling.ts      # Hook de atualização automática
│   └── services/
│       └── mockData.ts        # Dados de exemplo
├── docker-compose.yml         # Orquestração Docker
├── Dockerfile.frontend        # Build frontend
└── docs/                      # Documentação
```

---

## 🔐 Segurança

### Armazenamento de Credenciais

- ✅ Credenciais armazenadas no PostgreSQL
- ✅ Não expostas no frontend
- ✅ Auditoria de mudanças (tabela `settings_audit_log`)
- ⚠️ Armazenadas em texto puro (MVP)

### Recomendações para Produção

- 🔒 Criptografar credenciais no banco
- 🔒 Usar secrets management (Vault, AWS Secrets Manager)
- 🔒 Implementar rotação automática de credenciais
- 🔒 HTTPS obrigatório
- 🔒 Autenticação de usuários

---

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
# Backend
PORT=3001
DATABASE_URL=postgresql://admin:password@postgres:5432/soc_dashboard
CORS_ORIGIN=http://localhost:5173,http://localhost

# PostgreSQL
POSTGRES_USER=admin
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=soc_dashboard

# Node
NODE_ENV=production
```

### Configurar CORS

Edite `CORS_ORIGIN` no `.env`:

```bash
CORS_ORIGIN=https://dashboard.empresa.com,https://app.empresa.com
```

### Personalizar Polling

Edite `src/hooks/usePolling.ts`:

```typescript
const POLLING_INTERVAL = 30000; // 30 segundos (padrão)
```

---

## 📊 API Endpoints

### GET /api/dashboard
Retorna dados de todas as integrações configuradas.

**Resposta:**
```json
{
  "elastic": [...],
  "defender": [...],
  "opencti": [...],
  "tenable": [...],
  "rss": [...]
}
```

### POST /api/settings
Salva configurações das APIs.

**Body:**
```json
{
  "elasticUrl": "https://cluster:9200",
  "elasticKey": "api_key",
  "defenderTenantId": "tenant-id",
  "defenderClientId": "client-id",
  "defenderSecret": "secret",
  "openCtiUrl": "https://opencti.com",
  "openCtiToken": "token",
  "tenableAccessKey": "access-key",
  "tenableSecretKey": "secret-key",
  "rssFeeds": "feed1\nfeed2\nfeed3"
}
```

### GET /api/settings
Retorna configurações salvas.

### GET /api/health
Health check do backend.

---

## 🧪 Desenvolvimento Local

### Pré-requisitos

- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
npm install
npm run dev
```

Acesse: `http://localhost:5173`

---

## 🐳 Docker

### Build Manual

```bash
# Backend
docker build -t painel-backend -f Dockerfile .

# Frontend
docker build -t painel-frontend -f Dockerfile.frontend .
```

### Configuração Docker Compose

```yaml
services:
  backend:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://admin:password@postgres:5432/soc_dashboard
    depends_on:
      - postgres

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=soc_dashboard
    volumes:
      - postgres-data:/var/lib/postgresql/data
```

---

## 📈 Performance

### Otimizações Implementadas

- ✅ **Busca Paralela** - Todas APIs chamadas simultaneamente
- ✅ **Polling Inteligente** - Atualização apenas quando necessário
- ✅ **Cache de Configurações** - Configurações em memória
- ✅ **Timeout Individual** - Cada API com seu próprio timeout
- ✅ **Multi-stage Docker Build** - Imagens otimizadas

### Métricas Esperadas

- **Tempo de Resposta:** < 5s (todas APIs)
- **Update Interval:** 30s
- **Memory Usage (Backend):** ~100MB
- **Memory Usage (Frontend):** ~50MB
- **Memory Usage (PostgreSQL):** ~200MB

---

## 🤝 Contribuindo

### Como Contribuir

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-integracao`
3. Commit suas mudanças: `git commit -m 'feat: adicionar integração X'`
4. Push para a branch: `git push origin feature/nova-integracao`
5. Abra um Pull Request

### Padrões de Código

- **TypeScript** para todo código
- **ESLint** para linting
- **Prettier** para formatação
- **Conventional Commits** para mensagens

### Adicionar Nova Integração

1. Criar serviço em `backend/src/services/nome.ts`
2. Implementar interface padrão:
   ```typescript
   interface Alert {
     id: string;
     source: string;
     severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
     title: string;
     description: string;
     timestamp: string;
   }
   ```
3. Adicionar no endpoint `/api/dashboard`
4. Documentar em `CONFIGURACAO_APIS.md`

---

## 📝 Changelog

### [1.0.0] - 2026-02-04

#### Adicionado
- ✅ Integração com Elasticsearch
- ✅ Integração com Microsoft Defender
- ✅ Integração com OpenCTI
- ✅ Integração com Tenable.io
- ✅ Integração com RSS Feeds
- ✅ Dashboard em tempo real
- ✅ Painel de configurações
- ✅ Docker Compose para deploy
- ✅ Documentação completa

#### Corrigido
- ✅ Erro 400 na API do Tenable
- ✅ Healthcheck do PostgreSQL
- ✅ Build do frontend com Rollup

---

## 🐛 Issues Conhecidos

### Limitações Atuais

1. **Credenciais em texto puro** - MVP, deve ser criptografado em produção
2. **Sem autenticação de usuários** - Dashboard público
3. **Sem rate limiting** - APIs podem ser abusadas
4. **Sem caching de dados** - Cada request chama as APIs externas

### Roadmap

- [ ] Implementar autenticação de usuários (JWT)
- [ ] Adicionar criptografia de credenciais
- [ ] Implementar caching (Redis)
- [ ] Rate limiting
- [ ] Webhooks para notificações
- [ ] Exportação de relatórios (PDF, CSV)
- [ ] Filtros avançados no dashboard
- [ ] Gráficos e visualizações
- [ ] Mobile responsivo

---

## 📞 Suporte

### Documentação
- 📖 **[INDICE.md](INDICE.md)** - Índice completo
- 📖 **[CONFIGURACAO_APIS.md](CONFIGURACAO_APIS.md)** - Configuração das APIs
- 📖 **[COMANDOS_RAPIDOS.md](COMANDOS_RAPIDOS.md)** - Troubleshooting

### Comandos Úteis

```bash
# Ver logs
docker compose logs -f backend

# Restart backend
docker compose restart backend

# Rebuild
docker compose build backend --no-cache

# Verificar configurações
docker compose exec postgres psql -U admin -d soc_dashboard \
  -c "SELECT * FROM api_settings;"
```

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **SOC Dashboard Team** - Implementação inicial

---

## 🙏 Agradecimentos

- **Elasticsearch** - SIEM e analytics
- **Microsoft** - Defender API
- **OpenCTI** - Threat Intelligence platform
- **Tenable** - Vulnerability scanner
- **React Community** - UI framework

---

**Status do Projeto:** ✅ Production Ready  
**Versão Atual:** 1.0.0  
**Data de Release:** 2026-02-04

**🚀 Comece agora:** Leia [COMANDOS_RAPIDOS.md](COMANDOS_RAPIDOS.md) para deploy rápido!
