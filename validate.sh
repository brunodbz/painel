#!/bin/bash
# Script de Validação Pré-Deploy
# Execute este script ANTES de fazer docker compose build

set -e

echo "=========================================="
echo "   Validação Pré-Deploy - SOC Dashboard"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0

# Função para verificar
check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ((ERRORS++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# 1. Verificar Docker
echo "1. Verificando Docker..."
docker --version > /dev/null 2>&1
check $? "Docker instalado"

docker compose version > /dev/null 2>&1
check $? "Docker Compose instalado"

# 2. Verificar estrutura de arquivos
echo ""
echo "2. Verificando estrutura de arquivos..."

[ -f "docker-compose.yml" ]
check $? "docker-compose.yml existe"

[ -f "Dockerfile.frontend" ]
check $? "Dockerfile.frontend existe"

[ -f "backend/Dockerfile" ]
check $? "backend/Dockerfile existe"

[ -f "nginx.conf" ]
check $? "nginx.conf existe"

[ -f "package.json" ]
check $? "package.json (frontend) existe"

[ -f "yarn.lock" ]
check $? "yarn.lock (frontend) existe"

[ -f "backend/package.json" ]
check $? "backend/package.json existe"

[ -f "backend/src/server.ts" ]
check $? "backend/src/server.ts existe"

[ -f "backend/tsconfig.json" ]
check $? "backend/tsconfig.json existe"

# 3. Verificar .env
echo ""
echo "3. Verificando variáveis de ambiente..."

if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} Arquivo .env existe"
    
    # Verificar variáveis obrigatórias
    grep -q "POSTGRES_PASSWORD" .env
    check $? "POSTGRES_PASSWORD definida"
    
    grep -q "POSTGRES_USER" .env
    check $? "POSTGRES_USER definida"
    
    grep -q "POSTGRES_DB" .env
    check $? "POSTGRES_DB definida"
    
    # Verificar se senha padrão foi alterada
    if grep -q "POSTGRES_PASSWORD=secure_password" .env; then
        warn "Senha padrão detectada! MUDE para uma senha forte!"
    else
        echo -e "${GREEN}✓${NC} Senha customizada (não é a padrão)"
    fi
else
    echo -e "${RED}✗${NC} Arquivo .env NÃO existe!"
    echo "   Crie o arquivo .env baseado em INSTRUCOES_ENV.md"
    ((ERRORS++))
fi

# 4. Verificar backend NÃO tem yarn.lock
echo ""
echo "4. Verificando gerenciadores de pacotes..."

if [ -f "backend/yarn.lock" ]; then
    warn "backend/yarn.lock existe - backend deve usar npm!"
else
    echo -e "${GREEN}✓${NC} Backend não tem yarn.lock (correto - usa npm)"
fi

# 5. Verificar Dockerfiles
echo ""
echo "5. Verificando Dockerfiles..."

# Backend deve usar npm
if grep -q "yarn" backend/Dockerfile; then
    echo -e "${RED}✗${NC} backend/Dockerfile menciona yarn (deve usar npm)"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} backend/Dockerfile usa npm (correto)"
fi

# Frontend deve usar yarn
if grep -q "yarn" Dockerfile.frontend; then
    echo -e "${GREEN}✓${NC} Dockerfile.frontend usa yarn (correto)"
else
    warn "Dockerfile.frontend não menciona yarn"
fi

# 6. Verificar portas disponíveis
echo ""
echo "6. Verificando portas..."

check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        warn "Porta $1 está em uso"
        return 1
    else
        echo -e "${GREEN}✓${NC} Porta $1 disponível"
        return 0
    fi
}

check_port 80
check_port 3001
check_port 5432

# 7. Verificar espaço em disco
echo ""
echo "7. Verificando espaço em disco..."

AVAILABLE=$(df . | tail -1 | awk '{print $4}')
if [ $AVAILABLE -lt 5000000 ]; then  # 5GB
    warn "Pouco espaço em disco disponível"
else
    echo -e "${GREEN}✓${NC} Espaço em disco suficiente"
fi

# 8. Resumo
echo ""
echo "=========================================="
echo "              RESUMO"
echo "=========================================="
echo ""
echo "Erros: $ERRORS"
echo "Avisos: $WARNINGS"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Validação concluída com sucesso!${NC}"
    echo ""
    echo "Próximos passos:"
    echo "  1. docker compose build --no-cache"
    echo "  2. docker compose up -d"
    echo "  3. docker compose ps"
    echo "  4. docker compose logs -f"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Validação falhou com $ERRORS erro(s)${NC}"
    echo ""
    echo "Corrija os erros acima antes de fazer build."
    echo "Consulte TROUBLESHOOTING_DOCKER.md para ajuda."
    echo ""
    exit 1
fi
