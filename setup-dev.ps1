# Script de Setup para Desenvolvimento Local
# Execute com: .\setup-dev.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Setup Desenvolvimento Local - SOC Dashboard" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Verificar Node.js
Write-Host "1. Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
    
    # Verificar se é versão 20+
    $version = [int]$nodeVersion.Split('.')[0].Replace('v', '')
    if ($version -lt 20) {
        Write-Host "   ✗ Node.js 20+ é necessário. Atual: $nodeVersion" -ForegroundColor Red
        Write-Host "   Baixe em: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ✗ Node.js não encontrado" -ForegroundColor Red
    Write-Host "   Baixe em: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar npm
Write-Host "`n2. Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✓ npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ✗ npm não encontrado" -ForegroundColor Red
    exit 1
}

# Verificar Yarn
Write-Host "`n3. Verificando Yarn..." -ForegroundColor Yellow
try {
    $yarnVersion = yarn --version
    Write-Host "   ✓ Yarn instalado: $yarnVersion" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Yarn não encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g yarn
    Write-Host "   ✓ Yarn instalado" -ForegroundColor Green
}

# Configurar Backend
Write-Host "`n4. Configurando Backend..." -ForegroundColor Yellow

# Perguntar configuração do banco
Write-Host "`n   Escolha a opção de banco de dados:" -ForegroundColor Cyan
Write-Host "   1. PostgreSQL Local (você precisa ter instalado)"
Write-Host "   2. ElephantSQL Online (gratuito, não precisa instalar)"
Write-Host "   3. Pular (configurar .env manualmente depois)"
$dbChoice = Read-Host "`n   Digite 1, 2 ou 3"

$databaseUrl = ""

switch ($dbChoice) {
    "1" {
        Write-Host "`n   Configuração PostgreSQL Local:" -ForegroundColor Cyan
        $dbUser = Read-Host "   Usuário do banco (padrão: admin)"
        if ([string]::IsNullOrEmpty($dbUser)) { $dbUser = "admin" }
        
        $dbPass = Read-Host "   Senha do banco" -AsSecureString
        $dbPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPass))
        
        $dbName = Read-Host "   Nome do banco (padrão: soc_dashboard)"
        if ([string]::IsNullOrEmpty($dbName)) { $dbName = "soc_dashboard" }
        
        $databaseUrl = "postgres://${dbUser}:${dbPassPlain}@localhost:5432/${dbName}"
    }
    "2" {
        Write-Host "`n   Acesse: https://www.elephantsql.com/" -ForegroundColor Cyan
        Write-Host "   Crie uma conta gratuita e copie a URL de conexão" -ForegroundColor Yellow
        $databaseUrl = Read-Host "`n   Cole a URL completa do ElephantSQL"
    }
    "3" {
        Write-Host "   ⚠ Você precisará criar backend/.env manualmente" -ForegroundColor Yellow
        $databaseUrl = "postgres://admin:senha@localhost:5432/soc_dashboard"
    }
}

# Criar arquivo .env do backend
$backendEnv = @"
PORT=3001
DATABASE_URL=$databaseUrl
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
"@

Set-Location backend
New-Item -Path ".env" -ItemType File -Force -Value $backendEnv | Out-Null
Write-Host "   ✓ Arquivo backend/.env criado" -ForegroundColor Green

# Instalar dependências do backend
Write-Host "`n5. Instalando dependências do backend..." -ForegroundColor Yellow
npm install
Write-Host "   ✓ Dependências do backend instaladas" -ForegroundColor Green

# Voltar para raiz e instalar dependências do frontend
Set-Location ..
Write-Host "`n6. Instalando dependências do frontend..." -ForegroundColor Yellow
yarn install
Write-Host "   ✓ Dependências do frontend instaladas" -ForegroundColor Green

# Resumo
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   ✓ Setup Concluído!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Próximos passos:`n" -ForegroundColor Yellow

Write-Host "1. Iniciar Backend (em um terminal):" -ForegroundColor Cyan
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   npm run dev`n" -ForegroundColor White

Write-Host "2. Iniciar Frontend (em outro terminal):" -ForegroundColor Cyan
Write-Host "   yarn dev`n" -ForegroundColor White

Write-Host "3. Acessar aplicação:" -ForegroundColor Cyan
Write-Host "   http://localhost:5173/settings`n" -ForegroundColor White

if ($dbChoice -eq "1") {
    Write-Host "⚠ IMPORTANTE: Certifique-se que o PostgreSQL está rodando!" -ForegroundColor Yellow
    Write-Host "   Verifique com: Get-Service | Where-Object {`$_.Name -like '*postgres*'}`n" -ForegroundColor Gray
}

Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
