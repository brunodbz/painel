# Script PowerShell para transferir correção para servidor Ubuntu

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$Username = "kryptus"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy da Correção Tenable" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se SCP está disponível
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SCP não encontrado. Instale OpenSSH Client:" -ForegroundColor Red
    Write-Host "   Settings > Apps > Optional Features > OpenSSH Client" -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Preparando arquivos para transferência..." -ForegroundColor Green

# Criar diretório temporário
$tempDir = "$env:TEMP\painel-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Copiar arquivo corrigido
$sourceFile = "backend\src\services\tenable.ts"
$destDir = "$tempDir\backend\src\services"

if (-not (Test-Path $sourceFile)) {
    Write-Host "❌ Arquivo não encontrado: $sourceFile" -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Path $destDir -Force | Out-Null
Copy-Item $sourceFile -Destination $destDir

Write-Host "✅ Arquivo copiado para $tempDir" -ForegroundColor Green

# Comprimir
$zipFile = "$env:TEMP\tenable-fix.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}

Compress-Archive -Path "$tempDir\*" -DestinationPath $zipFile

Write-Host "✅ Arquivo comprimido: $zipFile" -ForegroundColor Green
Write-Host ""

# Transferir para servidor
Write-Host "🚀 Transferindo para servidor $Username@${ServerIP}..." -ForegroundColor Cyan

try {
    scp $zipFile "${Username}@${ServerIP}:/tmp/tenable-fix.zip"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Arquivo transferido com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "  Próximos Passos no Servidor Ubuntu" -ForegroundColor Cyan
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Execute os comandos abaixo no servidor:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "ssh ${Username}@${ServerIP}" -ForegroundColor White
        Write-Host "cd /tmp" -ForegroundColor White
        Write-Host "unzip -o tenable-fix.zip -d /opt/painel/" -ForegroundColor White
        Write-Host "cd /opt/painel" -ForegroundColor White
        Write-Host "docker compose build backend --no-cache" -ForegroundColor White
        Write-Host "docker compose down" -ForegroundColor White
        Write-Host "docker compose up -d" -ForegroundColor White
        Write-Host "docker compose logs backend --tail 50" -ForegroundColor White
        Write-Host ""
        Write-Host "✅ Depois, teste: curl http://localhost:3001/api/dashboard | jq .tenable" -ForegroundColor Green
        Write-Host ""
        
        # Perguntar se quer conectar via SSH
        $connect = Read-Host "Deseja conectar via SSH agora? (S/N)"
        if ($connect -eq "S" -or $connect -eq "s") {
            ssh "${Username}@${ServerIP}"
        }
    } else {
        Write-Host "❌ Erro ao transferir arquivo" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro: $_" -ForegroundColor Red
    exit 1
} finally {
    # Limpar arquivos temporários
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item $zipFile -Force -ErrorAction SilentlyContinue
}
