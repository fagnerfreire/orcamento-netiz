# 🧪 GUIA COMPLETO DE TESTES - Sistema de Orçamento Netiz

## 📋 PRÉ-REQUISITOS

Antes de começar os testes, certifique-se de que:
- ✅ Node.js instalado (versão 14 ou superior)
- ✅ Dependências instaladas (`npm install`)
- ✅ Porta 3000 disponível

---

## 🚀 PASSO 1: INICIAR O SISTEMA

### No terminal, execute:

```bash
cd orcamento-netiz
node server.js
```

### Você deve ver:
```
✅ Banco de dados inicializado com sucesso!

  ╔═══════════════════════════════════════════╗
  ║   🚀 Sistema de Orçamento - Netiz       ║
  ║                                           ║
  ║   Servidor rodando em:                    ║
  ║   http://localhost:3000                   ║
  ║                                           ║
  ║   Admin padrão:                           ║
  ║   Email: admin@netiz.com.br              ║
  ║   Senha: admin123                         ║
  ╚═══════════════════════════════════════════╝

✅ Usuário admin criado: admin@netiz.com.br / admin123
```

✅ **SE APARECER ISSO, O SISTEMA ESTÁ FUNCIONANDO!**

---

## 🔐 PASSO 2: FAZER LOGIN

### 1. Abra o navegador e acesse:
```
http://localhost:3000
```

### 2. Você verá a tela de login com:
- Logo da Netiz (azul e verde)
- Campo de Email
- Campo de Senha
- Botão "Entrar"

### 3. Faça login com:
- **Email:** `admin@netiz.com.br`
- **Senha:** `admin123`

### 4. Clique em "Entrar"

✅ **SE ENTROU, O LOGIN ESTÁ FUNCIONANDO!**

---

## 📊 PASSO 3: TESTAR DASHBOARD

### Ao entrar, você verá:

#### Cards de Estatísticas (topo):
- Total de Orçamentos
- Aguardando Aprovação
- Aprovados
- Rejeitados

#### Resumo Consolidado:
- Total Orçado
- Total Realizado  
- % Execução

#### Gráficos (NOVOS! ✨):
- 📈 Evolução Mensal (gráfico de linha)
- 🍩 Distribuição por Categoria (gráfico de pizza)
- 📊 Orçamento por Departamento (gráfico de barras)
- 📊 Comparativo Trimestral (gráfico de barras)

**Obs:** Os gráficos só aparecerão depois que você criar orçamentos!

✅ **SE VIU A DASHBOARD, ESTÁ FUNCIONANDO!**

---

## 🏢 PASSO 4: CRIAR DEPARTAMENTOS

### 1. No menu lateral, clique em **"Departamentos"**

### 2. Clique no botão **"+ Novo Departamento"**

### 3. Crie os seguintes departamentos:

#### Departamento 1:
- **Nome:** GMS > COM
- **Tipo:** Comercial
- **Descrição:** Gestão Comercial e Marketing
- **Status:** Ativo

#### Departamento 2:
- **Nome:** TI
- **Tipo:** Tecnologia
- **Descrição:** Tecnologia da Informação
- **Status:** Ativo

#### Departamento 3:
- **Nome:** RH
- **Tipo:** Administrativo
- **Descrição:** Recursos Humanos
- **Status:** Ativo

✅ **SE CRIOU OS DEPARTAMENTOS, ESTÁ FUNCIONANDO!**

---

## 🏷️ PASSO 5: CRIAR CATEGORIAS

### 1. No menu lateral, clique em **"Categorias"**

### 2. Clique no botão **"+ Nova Categoria"**

### 3. Crie as seguintes categorias:

- **Pessoal** - Salários e encargos
- **Marketing** - Publicidade e divulgação
- **Infraestrutura** - Equipamentos e instalações
- **Tecnologia** - Softwares e licenças
- **Veículos** - Combustível e manutenção
- **Treinamento** - Capacitação de equipe

**OU use a opção de importar a planilha que você já tem!**

✅ **SE CRIOU AS CATEGORIAS, ESTÁ FUNCIONANDO!**

---

## 👥 PASSO 6: CRIAR USUÁRIOS

### 1. No menu lateral, clique em **"Usuários"**

### 2. Clique no botão **"+ Novo Usuário"**

### 3. Crie um gestor:

- **Nome:** João Silva
- **Email:** joao.silva@netiz.com.br
- **Senha:** senha123
- **Perfil:** Gestor
- **Departamentos:** Selecione "GMS > COM"

### 4. Crie um usuário do financeiro:

- **Nome:** Maria Santos
- **Email:** maria.santos@netiz.com.br
- **Senha:** senha123
- **Perfil:** Financeiro

✅ **SE CRIOU OS USUÁRIOS, ESTÁ FUNCIONANDO!**

---

## 📅 PASSO 7: CONFIGURAR PERÍODOS

### 1. No menu lateral, clique em **"Períodos"**

### 2. Crie/Configure o período de 2024:

- **Ano:** 2024
- **Tipo:** Anual
- **Status:** Aberto

### 3. Configure os trimestres:

- Trimestre 1 (Q1): Aberto
- Trimestre 2 (Q2): Fechado
- Trimestre 3 (Q3): Fechado
- Trimestre 4 (Q4): Fechado

✅ **SE CONFIGUROU OS PERÍODOS, ESTÁ FUNCIONANDO!**

---

## 💰 PASSO 8: CRIAR ORÇAMENTO (COMO GESTOR)

### OPÇÃO A: Continuar como Admin e criar orçamento

### 1. No menu lateral, clique em **"Orçamentos"**

### 2. Clique em **"+ Novo Orçamento"**

### 3. Preencha:
- **Departamento:** GMS > COM
- **Ano:** 2024

### 4. Adicione itens ao orçamento:

#### Item 1:
- **Categoria:** Marketing
- **Descrição:** Panfletos para divulgação
- **Valores mensais (Jan-Dez):** R$ 2.500,00 cada mês

#### Item 2:
- **Categoria:** Pessoal
- **Descrição:** Comissões vendedores
- **Valores mensais (Jan-Dez):** R$ 5.000,00 cada mês

#### Item 3:
- **Categoria:** Veículos
- **Descrição:** Combustível equipe comercial
- **Valores mensais (Jan-Dez):** R$ 1.500,00 cada mês

### 5. Clique em **"Submeter para Aprovação"**

✅ **SE CRIOU O ORÇAMENTO, ESTÁ FUNCIONANDO!**

---

## ✅ PASSO 9: APROVAR ORÇAMENTO (COMO ADMIN)

### 1. Vá em **"Orçamentos"**

### 2. Veja o orçamento com status **"Aguardando Aprovação"**

### 3. Clique em **"Ver Detalhes"**

### 4. Revise os itens e valores

### 5. Clique em **"Aprovar"**

### 6. Adicione uma observação (opcional):
- "Orçamento aprovado conforme apresentado"

### 7. Confirme a aprovação

✅ **SE APROVOU, ESTÁ FUNCIONANDO!**

---

## 💵 PASSO 10: LANÇAR VALORES REALIZADOS

### OPÇÃO A: Como Admin

### 1. Vá em **"Orçamentos"**

### 2. Abra o orçamento aprovado

### 3. Clique em **"Lançar Realizado"**

### 4. Selecione:
- **Item:** Panfletos para divulgação
- **Mês:** Janeiro
- **Valor Realizado:** R$ 2.300,00
- **Observação:** "Campanha promocional janeiro"

### 5. Salve o lançamento

### 6. Repita para outros meses e itens

✅ **SE LANÇOU VALORES, ESTÁ FUNCIONANDO!**

---

## 📊 PASSO 11: VISUALIZAR GRÁFICOS

### 1. Volte para o **"Dashboard"**

### 2. Agora você verá os gráficos populados:

- 📈 **Evolução Mensal:** Linha mostrando orçado vs realizado
- 🍩 **Por Categoria:** Pizza com distribuição das categorias
- 📊 **Por Departamento:** Barras comparando departamentos
- 📊 **Trimestral:** Barras com análise trimestral

### 3. Passe o mouse sobre os gráficos para ver detalhes

✅ **SE VIU OS GRÁFICOS, ESTÁ FUNCIONANDO!**

---

## 📄 PASSO 12: GERAR RELATÓRIOS

### 1. No menu lateral, clique em **"Relatórios"** (NOVO!)

### 2. Você verá 3 opções:

#### Opção 1: Relatório Consolidado
- Clique em **"Exportar PDF"**
- Baixe o arquivo JSON/PDF

#### Opção 2: Análise de Variação
- Clique em **"Exportar PDF"**
- Veja o comparativo orçado vs realizado

#### Opção 3: Por Departamento
- Selecione "GMS > COM"
- Clique em **"Exportar PDF"**
- Baixe o relatório específico

### 3. Clique em **"Atualizar"** para ver preview

✅ **SE EXPORTOU RELATÓRIOS, ESTÁ FUNCIONANDO!**

---

## 📝 PASSO 13: VERIFICAR LOGS

### 1. No menu lateral, clique em **"Logs"** (NOVO!)

### 2. Você verá uma lista de TODAS as ações realizadas:
- Data/Hora
- Usuário que fez
- Ação realizada
- IP de origem

### 3. Perceba que TUDO que você fez foi registrado:
- Login
- Criação de departamentos
- Criação de categorias
- Criação de orçamentos
- Aprovações
- Lançamentos

✅ **SE VIU OS LOGS, AUDITORIA ESTÁ FUNCIONANDO!**

---

## 💾 PASSO 14: TESTAR BACKUP

### 1. No menu lateral, clique em **"Backup"** (NOVO!)

### 2. Você verá:
- Mensagem sobre backup automático (2h da manhã)
- Lista de backups existentes

### 3. Clique em **"Criar Backup Agora"**

### 4. Aguarde a confirmação

### 5. Veja o novo backup na lista com:
- Nome do arquivo
- Data/Hora
- Tamanho

### 6. Teste o download:
- Clique em **"Download"** em algum backup
- O arquivo .db será baixado

### ⚠️ NÃO teste "Restaurar" ainda (isso apagaria seus dados de teste!)

✅ **SE CRIOU E BAIXOU BACKUP, ESTÁ FUNCIONANDO!**

---

## 🔄 PASSO 15: TESTAR CONTESTAÇÕES

### 1. Faça logout (canto inferior do menu)

### 2. Faça login como gestor:
- **Email:** joao.silva@netiz.com.br
- **Senha:** senha123

### 3. Vá em **"Orçamentos"**

### 4. Veja apenas os orçamentos do departamento dele

### 5. Abra o orçamento e vá em um valor realizado

### 6. Clique em **"Contestar"**

### 7. Informe o motivo:
- "Este valor não pertence ao nosso departamento"

### 8. Submeta a contestação

### 9. Faça logout e entre como admin novamente

### 10. Vá em **"Contestações"**

### 11. Veja a contestação pendente

### 12. Resolva ou rejeite a contestação

✅ **SE CONTESTOU E RESOLVEU, ESTÁ FUNCIONANDO!**

---

## ✅ CHECKLIST FINAL DE TESTES

Marque o que testou:

### Funcionalidades Básicas:
- [ ] Login funcionando
- [ ] Dashboard carregando
- [ ] Menu lateral navegando
- [ ] Logout funcionando

### Cadastros:
- [ ] Criar departamentos
- [ ] Editar departamentos
- [ ] Criar categorias
- [ ] Criar usuários
- [ ] Vincular gestor a departamento

### Orçamentos:
- [ ] Criar orçamento
- [ ] Adicionar itens
- [ ] Editar valores
- [ ] Submeter para aprovação
- [ ] Aprovar/Rejeitar
- [ ] Lançar valores realizados

### Novos Recursos:
- [ ] Ver gráficos interativos (4 tipos)
- [ ] Exportar relatórios (3 tipos)
- [ ] Visualizar logs de auditoria
- [ ] Criar backup manual
- [ ] Download de backup
- [ ] Criar contestação
- [ ] Resolver contestação

### Perfis:
- [ ] Admin vê tudo
- [ ] Gestor vê só seu departamento
- [ ] Financeiro pode lançar valores

---

## 🎯 RESULTADOS ESPERADOS

### ✅ SUCESSO SE:
1. Todos os itens do checklist funcionaram
2. Gráficos aparecem com dados
3. Relatórios são exportados
4. Logs registram todas as ações
5. Backup é criado e baixado
6. Cada perfil vê apenas o que deve ver

### ❌ PROBLEMA SE:
1. Erro ao fazer login
2. Páginas não carregam
3. Gráficos não aparecem
4. Relatórios não exportam
5. Logs não registram
6. Backup não funciona

---

## 📞 DÚVIDAS OU PROBLEMAS?

Se encontrar algum erro:

1. **Verifique o console do navegador** (F12)
2. **Verifique o log do servidor** (terminal onde rodou `node server.js`)
3. **Anote o erro exato** que apareceu
4. **Me informe** para que eu possa corrigir

---

## 🎊 PARABÉNS!

Se você completou todos os testes, o sistema está **100% FUNCIONANDO**!

Agora é só usar na Netiz para gerenciar os orçamentos de verdade! 🚀

---

**Desenvolvido com ❤️ para Netiz Internet**
