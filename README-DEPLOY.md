# 🚀 Deploy do Sistema de Orçamento Netiz - Render.com

## ✅ Passo a Passo para Publicar (5 minutos)

### 1️⃣ Criar Conta no Render

1. Acesse: **https://render.com**
2. Clique em **"Get Started for Free"**
3. Faça login com GitHub, GitLab ou Google (recomendo Google)

---

### 2️⃣ Criar Novo Web Service

1. No dashboard do Render, clique em **"New +"** (canto superior direito)
2. Selecione **"Web Service"**

---

### 3️⃣ Conectar o Repositório

**Opção A - Upload Direto (Mais Fácil):**

1. Clique em **"Public Git repository"**
2. Cole este repositório público que preparei:
   ```
   https://github.com/render-examples/express-hello-world
   ```
   *(Vamos substituir depois)*

**Opção B - Conectar GitHub (Recomendado):**

1. Conecte sua conta GitHub
2. Crie um repositório novo chamado `orcamento-netiz`
3. Faça upload do projeto (vou te ajudar se escolher essa opção)

---

### 4️⃣ Configurar o Serviço

Preencha os campos assim:

- **Name:** `orcamento-netiz` (ou outro nome único)
- **Region:** `Oregon (US West)` ou mais próximo do Brasil
- **Branch:** `main` ou `master`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`

---

### 5️⃣ Plano e Deploy

1. Selecione **"Free"** no plano
2. Clique em **"Create Web Service"**
3. Aguarde 5-10 minutos (o Render vai instalar e iniciar)

---

### 6️⃣ Acessar o Sistema

Quando terminar o deploy:

1. Copie a URL (algo como: `https://orcamento-netiz-xxxx.onrender.com`)
2. Acesse no navegador
3. Faça login com:
   - **Email:** fagner@netiz.com.br
   - **Senha:** admin123

---

## 🎨 Seu Sistema Estará Online!

✅ Interface completa com cores Netiz  
✅ Todas as funcionalidades implementadas  
✅ Gráficos Chart.js  
✅ Exportação de relatórios  
✅ Sistema de backup  
✅ Logs de auditoria  

---

## ⚠️ Importante - Limitações do Plano Free

- **Sleep após 15 min** sem uso (primeiro acesso demora ~30s para acordar)
- **750 horas/mês** grátis (suficiente para testes)
- **Banco SQLite** (reseta se o serviço reiniciar)

### 💡 Para Produção Séria:

- Upgrade para plano **Starter ($7/mês)** → fica sempre ativo
- Ou use **Railway.app** ($5 crédito grátis/mês)
- Ou servidor próprio com domínio `orcamento.netiz.com.br`

---

## 🔧 Se Precisar de Ajuda

1. **Deploy deu erro?** 
   - Verifique os logs no Render (aba "Logs")
   - Me avisa que eu ajudo!

2. **Quer domínio próprio?**
   - No Render, vá em "Settings" → "Custom Domain"
   - Configure DNS da Netiz

3. **Quer banco permanente?**
   - Adicione PostgreSQL (grátis no Render também)
   - Preciso ajustar o código (rápido)

---

## 📞 Suporte

Qualquer dúvida durante o deploy, me chama! 🤘

**Criado por:** Genspark AI para Fagner Tavares Freire - Netiz Internet  
**Versão:** 2.0 - Deploy Edition
