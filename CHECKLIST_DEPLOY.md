# ✅ Checklist de Deploy - SOC Dashboard

Use este checklist para acompanhar o progresso da implantação.

---

## 🎯 Fase 1: Preparação do Servidor

- [ ] Servidor Ubuntu 20.04/22.04 LTS provisionado
- [ ] Acesso SSH funcionando
- [ ] IP do servidor anotado: `___________________`
- [ ] (Opcional) Domínio configurado e apontando para o IP
- [ ] Domínio anotado: `___________________`

---

## 🔧 Fase 2: Configuração Inicial

- [ ] Sistema atualizado (`apt update && apt upgrade`)
- [ ] Usuário deploy criado
- [ ] Usuário deploy adicionado ao grupo sudo
- [ ] Firewall (UFW) configurado
  - [ ] Porta 22 (SSH) liberada
  - [ ] Porta 80 (HTTP) liberada
  - [ ] Porta 443 (HTTPS) liberada
- [ ] Firewall ativado

---

## 🐳 Fase 3: Instalação do Docker (Método Recomendado)

### Instalação:
- [ ] Dependências do Docker instaladas
- [ ] Repositório do Docker adicionado
- [ ] Docker CE instalado
- [ ] Docker Compose instalado
- [ ] Usuário deploy adicionado ao grupo docker
- [ ] Logout/login realizado após adicionar ao grupo
- [ ] Docker funcionando (`docker --version`)
- [ ] Docker Compose funcionando (`docker compose version`)

### Projeto:
- [ ] Repositório Git clonado
- [ ] Entrou no diretório do projeto (`cd ~/painel`)

### Configuração:
- [ ] Arquivo `.env` criado na raiz
- [ ] Senha do PostgreSQL alterada para senha forte
- [ ] CORS_ORIGIN ajustado com domínio/IP correto
- [ ] Variáveis de ambiente revisadas

### Build e Deploy:
- [ ] Build realizado (`docker compose build`)
  - Tempo aproximado: `_____ minutos`
  - Erros encontrados: [ ] Sim [ ] Não
- [ ] Containers iniciados (`docker compose up -d`)
- [ ] Todos os 3 containers rodando (`docker compose ps`)
  - [ ] soc_postgres (healthy)
  - [ ] soc_backend (running)
  - [ ] soc_frontend (running)

### Testes:
- [ ] Backend respondendo (`curl http://localhost:3001/api/health`)
- [ ] Resposta do healthcheck OK
- [ ] Banco de dados conectado (verificado no healthcheck)
- [ ] Frontend acessível no navegador (`http://IP-DO-SERVIDOR`)
- [ ] Dashboard carregando corretamente

---

## ⚙️ Fase 3 Alternativa: Instalação Manual

**Use APENAS se não usar Docker**

### Node.js e Dependências:
- [ ] Node.js 20.x instalado
- [ ] Yarn instalado globalmente
- [ ] PostgreSQL instalado
- [ ] PostgreSQL iniciado e habilitado
- [ ] Nginx instalado

### Banco de Dados:
- [ ] Usuário do banco criado
- [ ] Banco de dados criado
- [ ] Permissões concedidas
- [ ] Conexão testada

### Backend:
- [ ] Dependências instaladas (`yarn install`)
- [ ] Arquivo `.env` criado no backend
- [ ] DATABASE_URL configurada corretamente
- [ ] Build realizado (`yarn build`)
- [ ] Serviço systemd criado
- [ ] Serviço habilitado e iniciado
- [ ] Backend respondendo

### Frontend:
- [ ] Dependências instaladas (`yarn install`)
- [ ] Build realizado (`yarn build`)
- [ ] Arquivos copiados para `/var/www/soc-dashboard`
- [ ] Permissões ajustadas (www-data:www-data)

### Nginx:
- [ ] Arquivo de configuração criado
- [ ] Link simbólico criado em sites-enabled
- [ ] Site padrão removido
- [ ] Configuração testada (`nginx -t`)
- [ ] Nginx reiniciado
- [ ] Site acessível no navegador

---

## 🔒 Fase 4: Segurança e SSL

**Se você tem um domínio:**

- [ ] Certbot instalado
- [ ] Certificado SSL obtido
- [ ] Certificado instalado corretamente
- [ ] HTTP -> HTTPS redirect configurado
- [ ] Renovação automática testada (`certbot renew --dry-run`)
- [ ] Site acessível via HTTPS
- [ ] Cadeado verde no navegador

**Se Docker + SSL:**
- [ ] nginx.conf atualizado com configuração SSL
- [ ] docker-compose.yml atualizado (volumes de certificados)
- [ ] Containers reconstruídos e reiniciados
- [ ] HTTPS funcionando

---

## ✅ Fase 5: Verificação Final

### Funcionalidades:
- [ ] Dashboard carrega sem erros
- [ ] Menu lateral funciona
- [ ] Dados aparecem no dashboard
- [ ] Página de configurações acessível
- [ ] Sem erros no console do navegador (F12)

### Logs:
- [ ] Logs do backend sem erros (`docker compose logs backend`)
- [ ] Logs do frontend sem erros (`docker compose logs frontend`)
- [ ] Logs do PostgreSQL sem erros (`docker compose logs postgres`)

### Performance:
- [ ] Página carrega em menos de 3 segundos
- [ ] Sem lentidão perceptível
- [ ] Imagens e assets carregando

### Endpoints:
- [ ] `/api/health` retorna status OK
- [ ] `/api/dashboard` retorna resposta
- [ ] Frontend serve corretamente arquivos estáticos

---

## 🔄 Fase 6: Configuração de Manutenção

### Backup:
- [ ] Script de backup do banco criado
- [ ] Teste de backup realizado
- [ ] Backup restaurado com sucesso (teste)
- [ ] Local de armazenamento dos backups definido: `___________________`

### Monitoramento:
- [ ] Comandos de monitoramento testados
- [ ] `docker compose ps` funcionando
- [ ] `docker compose logs` funcionando
- [ ] Familiarizado com comandos de troubleshooting

### Documentação:
- [ ] Credenciais anotadas em local seguro
- [ ] Senhas do banco anotadas
- [ ] IPs e domínios documentados
- [ ] Guia de implantação arquivado para referência

---

## 📊 Informações do Deploy

Preencha para referência futura:

**Data do Deploy:** ___/___/_____

**Informações do Servidor:**
- IP: `___________________`
- Domínio: `___________________`
- Usuário SSH: `___________________`
- Localização: `___________________`

**Credenciais do Banco (armazene em local seguro!):**
- Usuário: `___________________`
- Senha: `[armazenado em gerenciador de senhas]`
- Nome do Banco: `___________________`

**Portas:**
- Frontend: `___________________`
- Backend: `___________________`
- PostgreSQL: `___________________`

**Método de Deploy:**
- [ ] Docker
- [ ] Manual

**SSL Configurado:**
- [ ] Sim
- [ ] Não

**Observações e Problemas Encontrados:**
```
___________________________________________
___________________________________________
___________________________________________
```

---

## 🎉 Deploy Concluído!

Se você marcou todos os checkboxes acima, seu deploy foi bem-sucedido!

### Próximos Passos:

1. **Configure backups automáticos**
   - Crie um cronjob para backup diário
   - Teste a restauração periodicamente

2. **Monitore os logs regularmente**
   ```bash
   docker compose logs -f
   ```

3. **Mantenha o sistema atualizado**
   ```bash
   # Atualizações do SO
   sudo apt update && sudo apt upgrade
   
   # Atualizações do projeto
   cd ~/painel
   git pull origin master
   docker compose build
   docker compose up -d
   ```

4. **Documente customizações**
   - Anote qualquer mudança que você fizer
   - Mantenha um log de alterações

---

## 📞 Suporte

Se você encontrou problemas:

- [ ] Consultei o arquivo `GUIA_IMPLANTACAO.md`
- [ ] Verifiquei a seção "Solução de Problemas"
- [ ] Consultei o arquivo `QUICK_REFERENCE.md`
- [ ] Verifiquei os logs com `docker compose logs -f`
- [ ] Problema resolvido: [ ] Sim [ ] Não

**Descrição do Problema (se não resolvido):**
```
___________________________________________
___________________________________________
```

---

**Versão do Checklist:** 1.0.0
**Última Atualização:** 2026-01-30
