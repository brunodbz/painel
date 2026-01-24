# Guia de Deploy: React (Vite) + TypeScript em VPS Linux (Ubuntu)

Este documento descreve o processo passo a passo para implantar a aplicação frontend do SOC Dashboard em um servidor VPS rodando Ubuntu 20.04 ou 22.04 LTS.

## Pré-requisitos

- Acesso root ou sudo a um servidor VPS Ubuntu.
- Um domínio apontado para o IP do servidor (necessário para SSL).
- Repositório Git do projeto hospedado (GitHub, GitLab, etc.).

---

## 1. Preparação do Servidor

Primeiro, vamos garantir que o sistema esteja atualizado e seguro.

### 1.1 Atualização do Sistema
Acesse o servidor via SSH e execute:

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Criação de Usuário (Não-Root)
Por segurança, não devemos rodar processos ou builds como root.

```bash
# Criar usuário 'deploy' (ou outro nome de sua preferência)
sudo adduser deploy

# Adicionar ao grupo sudo
sudo usermod -aG sudo deploy

# Mudar para o novo usuário
su - deploy
```

### 1.3 Configuração de Firewall (UFW)
Habilite apenas as portas essenciais (SSH, HTTP, HTTPS).

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
# Confirme com 'y' se solicitado
```

---

## 2. Instalação de Dependências

Instalaremos o Node.js, gerenciador de pacotes e o servidor web Nginx.

### 2.1 Instalar Node.js (LTS)
Usaremos o repositório oficial da NodeSource para pegar a versão LTS mais recente.

```bash
# Baixar script de instalação (Node 20.x recomendado)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js e ferramentas de build
sudo apt install -y nodejs build-essential
```

### 2.2 Instalar Yarn e Git
Como o projeto utiliza Yarn:

```bash
sudo npm install -g yarn
sudo apt install -y git nginx
```

---

## 3. Configuração da Aplicação

### 3.1 Clonar o Repositório
Vamos clonar o projeto na pasta home do usuário e depois moveremos os arquivos de build.

```bash
cd ~
# Substitua pela URL do seu repositório
git clone https://github.com/seu-usuario/soc-dashboard.git
cd soc-dashboard
```

### 3.2 Instalar Dependências e Configurar Variáveis
```bash
# Instalar dependências do projeto
yarn install

# Criar arquivo de variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações de produção (ex: URL da API)
nano .env
```

### 3.3 Build de Produção
Gere os arquivos estáticos otimizados. O Vite criará a pasta `dist`.

```bash
yarn build
```

### 3.4 Mover Arquivos para o Diretório Web
É uma boa prática servir os arquivos a partir de `/var/www`.

```bash
# Criar diretório da aplicação
sudo mkdir -p /var/www/soc-dashboard

# Copiar o conteúdo da pasta dist para o diretório web
sudo cp -r dist/* /var/www/soc-dashboard/

# Ajustar permissões para o Nginx conseguir ler os arquivos
sudo chown -R www-data:www-data /var/www/soc-dashboard
sudo chmod -R 755 /var/www/soc-dashboard
```

---

## 4. Configuração do Web Server (Nginx)

O Nginx servirá os arquivos estáticos e lidará com o roteamento do React (SPA).

### 4.1 Criar Bloco de Servidor
Crie um arquivo de configuração para o site.

```bash
sudo nano /etc/nginx/sites-available/soc-dashboard
```

Cole o seguinte conteúdo (ajuste `server_name` para seu domínio):

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    root /var/www/soc-dashboard;
    index index.html;

    # Configuração de Logs
    access_log /var/log/nginx/soc-dashboard.access.log;
    error_log /var/log/nginx/soc-dashboard.error.log;

    # Roteamento SPA (Single Page Application)
    # Qualquer rota não encontrada como arquivo físico será redirecionada para o index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para arquivos estáticos (JS, CSS, Imagens)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

### 4.2 Ativar o Site
Crie um link simbólico para a pasta `sites-enabled` e teste a configuração.

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/soc-dashboard /etc/nginx/sites-enabled/

# Remover configuração padrão do Nginx (opcional, mas recomendado se não usada)
sudo rm /etc/nginx/sites-enabled/default

# Testar sintaxe do Nginx
sudo nginx -t

# Se o teste der "successful", reinicie o Nginx
sudo systemctl restart nginx
```

Neste ponto, sua aplicação deve estar acessível via HTTP (`http://seu-dominio.com`).

---

## 5. Segurança (SSL/HTTPS)

Vamos configurar um certificado SSL gratuito usando Let's Encrypt e Certbot.

### 5.1 Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Gerar Certificado
O Certbot configurará automaticamente o SSL no Nginx e forçará o redirecionamento HTTPS.

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```
Siga as instruções na tela (insira e-mail para renovação, aceite os termos).

### 5.3 Verificação de Renovação Automática
O Certbot cria um cron job para renovação automática. Teste se está funcionando:

```bash
sudo certbot renew --dry-run
```

---

## Resumo de Comandos para Atualização (Redeploy)

Sempre que houver atualizações no código, siga este processo:

1. Acesse o servidor: `ssh deploy@seu-ip`
2. Vá para a pasta do repo: `cd ~/soc-dashboard`
3. Baixe as mudanças: `git pull origin main`
4. Instale novas deps (se houver): `yarn install`
5. Gere o build: `yarn build`
6. Atualize os arquivos de produção:
   ```bash
   sudo cp -r dist/* /var/www/soc-dashboard/
   ```
   *(Não é necessário reiniciar o Nginx para atualizações apenas de frontend)*
