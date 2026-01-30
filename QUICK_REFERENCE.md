# Quick Reference - Deploy Commands

## Docker Deploy (Recomendado)

```bash
# 1. Preparação inicial
sudo apt update && sudo apt upgrade -y
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 2. Instalar Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker ${USER}

# 3. Clonar projeto
cd ~
git clone <URL-DO-REPOSITORIO>
cd painel

# 4. Configurar variáveis (edite o arquivo)
nano .env

# 5. Deploy
docker compose build
docker compose up -d

# 6. Verificar
docker compose ps
docker compose logs -f
```

## Comandos Úteis

```bash
# Ver logs
docker compose logs -f
docker compose logs -f backend
docker compose logs -f frontend

# Parar/Iniciar
docker compose stop
docker compose start
docker compose restart

# Atualizar aplicação
git pull origin master
docker compose build
docker compose down
docker compose up -d

# Backup banco de dados
docker exec soc_postgres pg_dump -U admin soc_dashboard > backup_$(date +%Y%m%d).sql

# Remover tudo (cuidado!)
docker compose down -v
```

## SSL com Certbot

```bash
# Instalar
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado (parar frontend antes)
docker compose stop frontend
sudo certbot certonly --standalone -d seu-dominio.com -d www.seu-dominio.com
docker compose start frontend

# Testar renovação
sudo certbot renew --dry-run
```

## Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

## Troubleshooting

```bash
# Verificar status
docker compose ps

# Ver logs de erro
docker compose logs backend
docker compose logs frontend

# Testar backend
curl http://localhost:3001/api/health

# Testar banco de dados
docker exec soc_postgres psql -U admin -d soc_dashboard -c "SELECT 1;"

# Reiniciar serviço específico
docker compose restart backend

# Ver uso de recursos
docker stats
```

## Arquivo .env Template

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=SENHA_FORTE_AQUI
POSTGRES_DB=soc_dashboard
BACKEND_PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://seu-dominio.com,https://seu-dominio.com
FRONTEND_PORT=80
```
