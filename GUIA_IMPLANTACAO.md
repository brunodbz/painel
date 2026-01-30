# Guia Completo de Implantação - SOC Dashboard
# Ubuntu Server 20.04/22.04 LTS

Este guia foi criado para pessoas com pouca experiência em Linux. Siga todos os passos cuidadosamente.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Preparação do Servidor](#preparação-do-servidor)
3. [Instalação com Docker (Recomendado)](#instalação-com-docker-recomendado)
4. [Instalação Manual (Alternativa)](#instalação-manual-alternativa)
5. [Configuração de Segurança e SSL](#configuração-de-segurança-e-ssl)
6. [Manutenção e Atualização](#manutenção-e-atualização)
7. [Solução de Problemas](#solução-de-problemas)

---

## 🚀 Pré-requisitos

Antes de começar, você precisará:

- ✅ Um servidor VPS ou dedicado com Ubuntu 20.04 ou 22.04 LTS
- ✅ Acesso SSH (root ou usuário com sudo)
- ✅ Mínimo de 2GB RAM e 20GB de espaço em disco
- ✅ (Opcional) Um domínio apontando para o IP do servidor
- ✅ Código fonte do projeto (via Git)

**Informações que você precisará ter em mãos:**
- IP do servidor
- Usuário e senha SSH
- (Se usar domínio) Nome do domínio configurado

---

## 🔧 Preparação do Servidor

### Passo 1: Conectar ao Servidor

No seu computador, abra o terminal/PowerShell e conecte via SSH:

```bash
ssh seu-usuario@IP-DO-SERVIDOR
```

Exemplo:
```bash
ssh root@192.168.1.100
```

Digite a senha quando solicitado.

### Passo 2: Atualizar o Sistema

**IMPORTANTE:** Execute estes comandos um de cada vez e aguarde a conclusão.

```bash
sudo apt update
```

Aguarde terminar, então execute:

```bash
sudo apt upgrade -y
```

Este processo pode demorar alguns minutos.

### Passo 3: Criar Usuário de Deploy (Segurança)

Por segurança, não vamos usar o usuário root para rodar a aplicação.

```bash
sudo adduser deploy
```

O sistema pedirá uma senha. Escolha uma senha forte e anote-a.

Pressione ENTER para pular as informações adicionais (nome completo, telefone, etc).

Adicione o usuário ao grupo sudo:

```bash
sudo usermod -aG sudo deploy
```

### Passo 4: Configurar Firewall Básico

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Digite `y` quando perguntado se deseja continuar.

Verifique o status:

```bash
sudo ufw status
```

### Passo 5: Trocar para o Usuário Deploy

```bash
su - deploy
```

Digite a senha do usuário deploy.

---

## 🐳 Instalação com Docker (Recomendado)

Esta é a forma **mais fácil** de instalar. Recomendada para iniciantes.

### Passo 1: Instalar Docker e Docker Compose

Execute os comandos abaixo **um de cada vez**:

```bash
# Instalar dependências
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Adicionar chave GPG do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Adicionar repositório do Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Atualizar lista de pacotes
sudo apt update

# Instalar Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Adicionar seu usuário ao grupo docker
sudo usermod -aG docker ${USER}
```

**IMPORTANTE:** Após adicionar ao grupo docker, você precisa fazer logout e login novamente:

```bash
exit
su - deploy
```

Verifique se o Docker está funcionando:

```bash
docker --version
docker compose version
```

### Passo 2: Clonar o Projeto

```bash
cd ~
git clone https://github.com/seu-usuario/painel.git
cd painel
```

**Nota:** Substitua `https://github.com/seu-usuario/painel.git` pela URL real do seu repositório.

### Passo 3: Configurar Variáveis de Ambiente

Crie o arquivo de variáveis de ambiente na raiz do projeto:

```bash
nano .env
```

Cole o seguinte conteúdo (ajuste os valores conforme necessário):

```env
# Configurações do Banco de Dados
POSTGRES_USER=admin
POSTGRES_PASSWORD=TROQUE_POR_UMA_SENHA_FORTE
POSTGRES_DB=soc_dashboard

# Configurações do Backend
BACKEND_PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://seu-dominio.com,https://seu-dominio.com

# Configurações do Frontend
FRONTEND_PORT=80
```

**Importante:** 
- Troque `TROQUE_POR_UMA_SENHA_FORTE` por uma senha segura
- Troque `seu-dominio.com` pelo seu domínio (ou use o IP do servidor)

Para salvar e sair do nano:
- Pressione `Ctrl + X`
- Pressione `Y` para confirmar
- Pressione `Enter`

### Passo 4: Criar Arquivos de Configuração de Ambiente

Crie o arquivo `.env.example` no frontend (se não existir):

```bash
nano .env.example
```

Cole:

```env
# Frontend Environment Variables

# URL da API Backend (ajustar conforme ambiente)
VITE_API_URL=http://localhost:3001

# Outras configurações podem ser adicionadas aqui conforme necessário
```

Salve e saia (`Ctrl+X`, `Y`, `Enter`).

Crie o arquivo `.env.example` no backend:

```bash
nano backend/.env.example
```

Cole:

```env
# Backend Environment Variables

# Porta do servidor
PORT=3001

# Database Connection String
DATABASE_URL=postgres://admin:secure_password@postgres:5432/soc_dashboard

# Node Environment
NODE_ENV=production

# CORS Origins (separar múltiplas origens com vírgula)
CORS_ORIGIN=http://localhost:5173,http://localhost:80
```

Salve e saia.

### Passo 5: Construir e Iniciar os Containers

**Este passo pode demorar 5-15 minutos na primeira vez.**

```bash
docker compose build
```

Aguarde a construção completar. Quando terminar, inicie os containers:

```bash
docker compose up -d
```

O parâmetro `-d` faz os containers rodarem em segundo plano.

### Passo 6: Verificar se Está Funcionando

Verifique o status dos containers:

```bash
docker compose ps
```

Você deve ver 3 containers rodando: `soc_postgres`, `soc_backend`, e `soc_frontend`.

Teste o backend:

```bash
curl http://localhost:3001/api/health
```

Deve retornar algo como: `{"status":"ok","timestamp":"...","database":"connected"}`

### Passo 7: Acessar a Aplicação

Abra seu navegador e acesse:

```
http://IP-DO-SERVIDOR
```

Ou se configurou domínio:

```
http://seu-dominio.com
```

**🎉 Parabéns! A aplicação está rodando!**

Pule para a seção [Configuração de Segurança e SSL](#configuração-de-segurança-e-ssl).

---

## ⚙️ Instalação Manual (Alternativa)

Use esta opção se não quiser usar Docker ou se encontrou problemas com Docker.

### Passo 1: Instalar Node.js

```bash
# Baixar script de instalação do Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### Passo 2: Instalar PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar se está rodando
sudo systemctl status postgresql
```

Pressione `q` para sair da visualização do status.

### Passo 3: Configurar Banco de Dados

```bash
# Entrar no PostgreSQL como usuário postgres
sudo -u postgres psql
```

Agora você está dentro do console do PostgreSQL. Execute os comandos SQL:

```sql
-- Criar usuário
CREATE USER admin WITH PASSWORD 'TROQUE_POR_UMA_SENHA_FORTE';

-- Criar banco de dados
CREATE DATABASE soc_dashboard;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE soc_dashboard TO admin;

-- Sair
\q
```

### Passo 4: Instalar Yarn (apenas para frontend)

```bash
sudo npm install -g yarn
```

### Passo 5: Clonar e Configurar Projeto

```bash
cd ~
git clone https://github.com/seu-usuario/painel.git
cd painel
```

### Passo 6: Configurar Backend

```bash
cd backend

# Instalar dependências (backend usa npm)
npm install

# Criar arquivo de ambiente
nano .env
```

Cole o seguinte:

```env
PORT=3001
DATABASE_URL=postgres://admin:SUA_SENHA_AQUI@localhost:5432/soc_dashboard
NODE_ENV=production
CORS_ORIGIN=http://localhost:80,http://seu-dominio.com
```

Substitua `SUA_SENHA_AQUI` pela senha do banco que você criou.

Salve e saia (`Ctrl+X`, `Y`, `Enter`).

```bash
# Compilar o código
npm run build

# Testar o backend
npm start
```

Se tudo estiver OK, pressione `Ctrl+C` para parar.

### Passo 7: Configurar Frontend

```bash
cd ~/painel

# Instalar dependências (frontend usa yarn)
yarn install

# Compilar para produção
yarn build
```

### Passo 8: Instalar e Configurar Nginx

```bash
sudo apt install -y nginx
```

Criar configuração do site:

```bash
sudo nano /etc/nginx/sites-available/soc-dashboard
```

Cole o seguinte (ajuste `seu-dominio.com`):

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Frontend
    location / {
        root /var/www/soc-dashboard;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy para Backend
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/soc-dashboard;
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

Salve e saia.

### Passo 9: Copiar Arquivos do Frontend

```bash
# Criar diretório
sudo mkdir -p /var/www/soc-dashboard

# Copiar arquivos
sudo cp -r ~/painel/dist/* /var/www/soc-dashboard/

# Ajustar permissões
sudo chown -R www-data:www-data /var/www/soc-dashboard
sudo chmod -R 755 /var/www/soc-dashboard
```

### Passo 10: Ativar Site no Nginx

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/soc-dashboard /etc/nginx/sites-enabled/

# Remover site padrão
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Se OK, reiniciar Nginx
sudo systemctl restart nginx
```

### Passo 11: Configurar Backend como Serviço

Criar arquivo de serviço:

```bash
sudo nano /etc/systemd/system/soc-backend.service
```

Cole:

```ini
[Unit]
Description=SOC Dashboard Backend
After=network.target postgresql.service

[Service]
Type=simple
User=deploy
WorkingDirectory=/home/deploy/painel/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Salve e saia.

Ativar e iniciar o serviço:

```bash
sudo systemctl daemon-reload
sudo systemctl enable soc-backend
sudo systemctl start soc-backend

# Verificar status
sudo systemctl status soc-backend
```

Pressione `q` para sair.

### Passo 12: Verificar Funcionamento

```bash
# Testar backend
curl http://localhost:3001/api/health

# Testar frontend
curl http://localhost
```

Acesse no navegador: `http://IP-DO-SERVIDOR` ou `http://seu-dominio.com`

---

## 🔒 Configuração de Segurança e SSL

### Passo 1: Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### Passo 2: Obter Certificado SSL

**Nota:** Você **PRECISA** ter um domínio apontando para o IP do servidor.

Se estiver usando Docker:

```bash
# Parar o container do frontend temporariamente
docker compose stop frontend

# Obter certificado
sudo certbot certonly --standalone -d seu-dominio.com -d www.seu-dominio.com

# Reiniciar o container
docker compose start frontend
```

Se estiver usando instalação manual (com Nginx):

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Siga as instruções:
1. Digite seu e-mail
2. Aceite os termos (`Y`)
3. Escolha se quer receber e-mails (`Y` ou `N`)
4. Escolha redirecionar HTTP para HTTPS (opção `2`)

### Passo 3: Testar Renovação Automática

```bash
sudo certbot renew --dry-run
```

Se não mostrar erros, está tudo OK. O Certbot renovará automaticamente o certificado.

### Passo 4: Configurar SSL no Docker (se necessário)

Se você usou Docker e Certbot, precisa configurar Nginx no container para usar SSL.

Edite o arquivo `nginx.conf`:

```bash
nano ~/painel/nginx.conf
```

Adicione a configuração SSL (exemplo abaixo):

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

Atualize o `docker-compose.yml` para montar os certificados:

```bash
nano ~/painel/docker-compose.yml
```

Na seção `frontend`, adicione volumes:

```yaml
  frontend:
    build: 
      context: .
      dockerfile: Dockerfile.frontend
    container_name: soc_frontend
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - backend
    networks:
      - soc_network
    restart: unless-stopped
```

Reconstruir e reiniciar:

```bash
cd ~/painel
docker compose down
docker compose build frontend
docker compose up -d
```

---

## 🔄 Manutenção e Atualização

### Atualizar a Aplicação (Docker)

Quando houver atualizações no código:

```bash
cd ~/painel

# Baixar atualizações
git pull origin master

# Reconstruir containers
docker compose build

# Reiniciar
docker compose down
docker compose up -d

# Verificar logs
docker compose logs -f
```

Pressione `Ctrl+C` para sair dos logs.

### Atualizar a Aplicação (Manual)

```bash
cd ~/painel

# Baixar atualizações
git pull origin master

# Atualizar Backend (usa npm)
cd backend
npm install
npm run build
sudo systemctl restart soc-backend

# Atualizar Frontend (usa yarn)
cd ~/painel
yarn install
yarn build
sudo cp -r dist/* /var/www/soc-dashboard/
```

### Ver Logs

**Docker:**

```bash
# Todos os serviços
docker compose logs -f

# Apenas backend
docker compose logs -f backend

# Apenas frontend
docker compose logs -f frontend
```

**Manual:**

```bash
# Logs do backend
sudo journalctl -u soc-backend -f

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Fazer Backup do Banco de Dados

**Docker:**

```bash
# Criar backup
docker exec soc_postgres pg_dump -U admin soc_dashboard > backup_$(date +%Y%m%d).sql

# Restaurar backup
docker exec -i soc_postgres psql -U admin soc_dashboard < backup_20260130.sql
```

**Manual:**

```bash
# Criar backup
sudo -u postgres pg_dump soc_dashboard > backup_$(date +%Y%m%d).sql

# Restaurar backup
sudo -u postgres psql soc_dashboard < backup_20260130.sql
```

---

## 🔍 Solução de Problemas

### Problema: "Cannot connect to the Docker daemon"

**Solução:**

```bash
# Verificar se Docker está rodando
sudo systemctl status docker

# Se não estiver, iniciar
sudo systemctl start docker

# Verificar se seu usuário está no grupo docker
groups

# Se não estiver, adicionar e fazer logout/login
sudo usermod -aG docker ${USER}
exit
su - deploy
```

### Problema: "Port 80 already in use"

**Solução:**

```bash
# Ver o que está usando a porta
sudo lsof -i :80

# Se for Apache
sudo systemctl stop apache2
sudo systemctl disable apache2

# Se for outro serviço Nginx
sudo systemctl stop nginx

# Então reiniciar seus containers
docker compose restart
```

### Problema: Frontend não carrega

**Verificações:**

```bash
# 1. Verificar se container está rodando
docker compose ps

# 2. Ver logs do frontend
docker compose logs frontend

# 3. Verificar se Nginx está configurado corretamente
docker exec soc_frontend nginx -t

# 4. Verificar se arquivos foram copiados
docker exec soc_frontend ls -la /usr/share/nginx/html
```

### Problema: Backend não conecta ao banco

**Verificações:**

```bash
# 1. Verificar se PostgreSQL está rodando
docker compose ps postgres

# 2. Ver logs do banco
docker compose logs postgres

# 3. Verificar variáveis de ambiente
docker exec soc_backend env | grep DATABASE

# 4. Testar conexão manualmente
docker exec soc_postgres psql -U admin -d soc_dashboard -c "SELECT 1;"
```

### Problema: Erro 502 Bad Gateway

**Significa que o Nginx não consegue se comunicar com o backend.**

```bash
# 1. Verificar se backend está rodando
docker compose ps backend

# 2. Ver logs do backend
docker compose logs backend

# 3. Testar backend diretamente
curl http://localhost:3001/api/health

# 4. Reiniciar backend
docker compose restart backend
```

### Problema: Certificado SSL não funciona

**Verificações:**

```bash
# 1. Verificar se certificado existe
sudo ls -la /etc/letsencrypt/live/seu-dominio.com/

# 2. Testar renovação
sudo certbot renew --dry-run

# 3. Verificar configuração Nginx
sudo nginx -t

# 4. Ver logs do Certbot
sudo cat /var/log/letsencrypt/letsencrypt.log
```

### Obter Ajuda

Se você continuar tendo problemas:

1. Verifique os logs detalhadamente
2. Anote a mensagem de erro exata
3. Verifique se seguiu todos os passos corretamente
4. Procure ajuda em fóruns ou com o desenvolvedor

---

## 📞 Contatos e Suporte

Para suporte adicional:

- Documentação do projeto: [README.md](README.md)
- Issues no GitHub: [Link do repositório]

---

## ✅ Checklist Final

Após a instalação, verifique:

- [ ] Aplicação acessível via navegador
- [ ] Backend respondendo em `/api/health`
- [ ] Banco de dados conectado
- [ ] SSL configurado (se aplicável)
- [ ] Firewall configurado corretamente
- [ ] Containers/serviços configurados para iniciar automaticamente
- [ ] Backup do banco de dados configurado

**Parabéns! 🎉 Seu SOC Dashboard está implantado e funcionando!**
