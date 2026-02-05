# Iniciar Backend em Modo Desenvolvimento
Write-Host "Iniciando Backend..." -ForegroundColor Cyan

Set-Location backend

# Verificar se .env existe
if (-not (Test-Path ".env")) {
    Write-Host "Erro: arquivo .env não encontrado!" -ForegroundColor Red
    Write-Host "Execute primeiro: .\setup-dev.ps1" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Backend rodando em http://localhost:3001" -ForegroundColor Green
Write-Host "Pressione Ctrl+C para parar`n" -ForegroundColor Yellow

npm run dev
