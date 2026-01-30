# SOC Dashboard Full-Stack

Dashboard de monitoramento de segurança centralizado (SOC - Security Operations Center) com arquitetura full-stack moderna.

## 📋 Visão Geral

Aplicação web completa para centralizar e visualizar dados de segurança de múltiplas fontes, com interface moderna e responsiva.

## 🏗️ Estrutura do Projeto

```
painel/
├── src/                      # Frontend React + TypeScript
│   ├── components/           # Componentes reutilizáveis
│   ├── pages/               # Páginas da aplicação
│   ├── services/            # Serviços e mock data
│   └── hooks/               # Custom hooks
├── backend/                  # Backend Node.js + Express
│   └── src/                 # Código TypeScript do backend
├── docker-compose.yml       # Orquestração dos containers
├── Dockerfile.frontend      # Build do frontend
└── nginx.conf              # Configuração do servidor web
```

## 🛠️ Tecnologias

### Frontend
- **React 19** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **React Router** - Roteamento
- **Lucide React** - Ícones

### Backend
- **Node.js 18+** - Runtime
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados
- **Helmet** - Segurança HTTP
- **CORS** - Controle de origem

### Infraestrutura
- **Docker & Docker Compose** - Containerização
- **Nginx** - Servidor web e proxy reverso
- **PostgreSQL 15** - Banco de dados relacional

## 🚀 Começando

### Pré-requisitos

- **Node.js 18+** e **Yarn**
- **Docker & Docker Compose** (para deploy)
- **PostgreSQL 15** (se não usar Docker)

### Desenvolvimento Local Rápido

O frontend pode rodar independentemente com dados mockados:

```bash
# Instalar dependências
yarn install

# Iniciar servidor de desenvolvimento
yarn dev
```

Acesse: `http://localhost:5173`

### Deploy Completo com Docker (Recomendado)

**📚 Consulte o guia detalhado:** [GUIA_IMPLANTACAO.md](GUIA_IMPLANTACAO.md)

Resumo rápido:

```bash
# 1. Clonar repositório
git clone <URL-DO-REPOSITORIO>
cd painel

# 2. Criar arquivo .env (veja INSTRUCOES_ENV.md)
nano .env

# 3. Build e iniciar
docker compose build
docker compose up -d

# 4. Verificar
docker compose ps
```

Acesse: `http://localhost` ou `http://SEU-IP`

## 📄 Documentação Completa

Este projeto inclui documentação detalhada para facilitar a implantação:

| Documento | Descrição |
|-----------|-----------|
| [**GUIA_IMPLANTACAO.md**](GUIA_IMPLANTACAO.md) | Guia completo passo a passo para deploy em Ubuntu Server |
| [**QUICK_REFERENCE.md**](QUICK_REFERENCE.md) | Comandos rápidos para manutenção |
| [**INSTRUCOES_ENV.md**](INSTRUCOES_ENV.md) | Como configurar variáveis de ambiente |
| [**CHECKLIST_DEPLOY.md**](CHECKLIST_DEPLOY.md) | Checklist interativo de implantação |
| [**RESUMO_ALTERACOES.md**](RESUMO_ALTERACOES.md) | Resumo das melhorias de segurança implementadas |

## 🔒 Segurança

O projeto implementa várias camadas de segurança:

- ✅ CORS restrito por configuração
- ✅ Helmet.js para headers de segurança
- ✅ Variáveis de ambiente para dados sensíveis
- ✅ Healthchecks para monitoramento
- ✅ Tratamento de erros sem expor detalhes
- ✅ SSL/HTTPS pronto para produção

## 🎯 Funcionalidades

### Implementadas
- ✅ Dashboard em tempo real com polling (30s)
- ✅ Layout responsivo (Bento Grid)
- ✅ Indicadores visuais de severidade
- ✅ Sistema de navegação com sidebar
- ✅ Página de configurações
- ✅ Mock data para desenvolvimento
- ✅ Healthcheck API

### Planejadas (Stubs)
- 🔲 Integração Elastic SIEM
- 🔲 Integração Microsoft Defender 365
- 🔲 Integração Tenable Nessus
- 🔲 Integração OpenCTI
- 🔲 Feed RSS de notícias de segurança
- 🔲 Sistema de alertas
- 🔲 Histórico de eventos

## 📊 Estrutura do Banco de Dados

```sql
-- Estrutura básica (a ser expandida)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50),
    severity VARCHAR(20),
    title TEXT,
    description TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Comandos Úteis

### Docker

```bash
# Ver logs
docker compose logs -f

# Reiniciar serviços
docker compose restart

# Parar tudo
docker compose down

# Backup do banco
docker exec soc_postgres pg_dump -U admin soc_dashboard > backup.sql
```

### Desenvolvimento

```bash
# Frontend
yarn dev          # Servidor de desenvolvimento
yarn build        # Build de produção
yarn preview      # Preview do build

# Backend
cd backend
yarn dev          # Modo desenvolvimento
yarn build        # Compilar TypeScript
yarn start        # Iniciar em produção
```

## 🔍 Troubleshooting

### Frontend não carrega

```bash
docker compose logs frontend
curl http://localhost
```

### Backend não responde

```bash
docker compose logs backend
curl http://localhost:3001/api/health
```

### Erro de banco de dados

```bash
docker compose logs postgres
docker exec soc_postgres psql -U admin -d soc_dashboard -c "SELECT 1;"
```

Para problemas mais complexos, consulte: [GUIA_IMPLANTACAO.md](GUIA_IMPLANTACAO.md#solução-de-problemas)

## 📝 Variáveis de Ambiente

### Raiz do projeto (.env)

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=senha_forte
POSTGRES_DB=soc_dashboard
BACKEND_PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://seu-dominio.com
FRONTEND_PORT=80
```

**Veja instruções completas:** [INSTRUCOES_ENV.md](INSTRUCOES_ENV.md)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Autores

- **Bruno** - Desenvolvimento inicial

## 🙏 Agradecimentos

- Comunidade React
- Documentação do Docker
- Let's Encrypt (SSL gratuito)

---

**Versão:** 1.0.0  
**Última Atualização:** 2026-01-30  
**Status:** ✅ Pronto para Deploy
