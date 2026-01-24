# SOC Dashboard Full-Stack

Aplicação de monitoramento de segurança centralizado.

## Estrutura do Projeto

- **Frontend**: React, Tailwind CSS, TypeScript (Pasta raiz/src)
- **Backend**: Node.js, Express, TypeScript (Pasta `backend/`)
- **Infra**: Docker Compose

## Como rodar localmente (Desenvolvimento)

### Frontend (Preview Imediato)
Este ambiente já está configurado para rodar o frontend.
1. As dependências serão instaladas automaticamente.
2. O servidor iniciará em breve.
3. O frontend usa dados "mockados" (`src/services/mockData.ts`) por padrão para demonstração sem necessidade de backend rodando.

### Backend (Produção/Local)

Para rodar a stack completa com banco de dados real:

1. Certifique-se de ter Docker e Docker Compose instalados.
2. Navegue até a pasta raiz.
3. Crie um arquivo `.env` na pasta `backend/` baseado nas variáveis do `docker-compose.yml`.
4. Execute:
   ```bash
   docker-compose up --build
   ```

## Funcionalidades

- **Dashboard em Tempo Real**: Polling a cada 30s.
- **Integrações Suportadas (Stub)**: Elastic, Defender 365, Tenable, OpenCTI.
- **Visualização**: Bento Grid responsivo com indicadores visuais de severidade.
