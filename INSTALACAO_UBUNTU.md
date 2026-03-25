# Instalação e Configuração Padrão (Ubuntu Server)

Guia rápido para subir o **Painel SOC Dashboard** em um servidor Ubuntu (22.04/24.04) com Docker.

---

## 1) Pré-requisitos

- Ubuntu Server com acesso sudo
- Porta **80/tcp** liberada no firewall/security group
- DNS (opcional) apontando para o IP do servidor

---

## 2) Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

---

## 3) Instalar Docker + plugin Compose

```bash
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
```

### (Opcional) rodar Docker sem sudo

```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## 4) Clonar projeto

```bash
git clone <URL_DO_REPOSITORIO> painel
cd painel
```

---

## 5) Configurar variáveis de ambiente

```bash
cp .env.example .env
nano .env
```

Ajuste pelo menos:
- `POSTGRES_PASSWORD`
- `CORS_ORIGIN` (domínio/IP real do servidor)
- `FRONTEND_PORT` (normalmente 80)

---

## 6) Validar antes do deploy

```bash
chmod +x validate.sh
./validate.sh
```

Se houver erro, corrija e execute novamente.

---

## 7) Subir aplicação

```bash
docker compose build --no-cache
docker compose up -d
docker compose ps
```

Logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

---

## 8) Acesso inicial

- Dashboard: `http://IP_DO_SERVIDOR/`
- Configuração: `http://IP_DO_SERVIDOR/settings`

Configure as integrações (Elasticsearch, Defender, OpenCTI, Tenable, RSS) na tela de configurações.

---

## 9) Reinício e atualização

### Reiniciar stack

```bash
docker compose restart
```

### Atualizar código e aplicar nova versão

```bash
git pull
docker compose build --no-cache
docker compose up -d
```

---

## 10) Hardening recomendado para produção

- Use senha forte em `POSTGRES_PASSWORD`
- Restrinja acesso SSH (sem senha, chave + fail2ban)
- Ative firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw enable
```

- Coloque HTTPS com proxy reverso (Nginx/Traefik + Let's Encrypt)
- Faça backup do volume do PostgreSQL (`postgres_data`)

---

## 11) Troubleshooting rápido

- Containers não sobem:
  ```bash
  docker compose ps
  docker compose logs --tail=200
  ```
- Porta 80 ocupada:
  ```bash
  sudo lsof -i :80
  ```
- Banco indisponível:
  ```bash
  docker compose logs postgres
  ```

