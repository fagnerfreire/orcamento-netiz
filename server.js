require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./database');
const { agendarBackupAutomatico } = require('./utils/backup');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Inicializar banco de dados
initDatabase();

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/categorias', require('./routes/categorias'));
app.use('/api/departamentos', require('./routes/departamentos'));
app.use('/api/periodos', require('./routes/periodos'));
app.use('/api/orcamentos', require('./routes/orcamentos'));
app.use('/api/contestacoes', require('./routes/contestacoes'));
app.use('/api/notificacoes', require('./routes/notificacoes'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/relatorios', require('./routes/relatorios'));
app.use('/api/backup', require('./routes/backup'));

// Rota principal - serve o frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    erro: 'Erro interno do servidor',
    mensagem: err.message 
  });
});

// Agendar backup automático
agendarBackupAutomatico();

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   🚀 Sistema de Orçamento - Netiz       ║
  ║                                           ║
  ║   Servidor rodando em:                    ║
  ║   http://localhost:${PORT}                    ║
  ║                                           ║
  ║   Admin padrão:                           ║
  ║   Email: admin@netiz.com.br              ║
  ║   Senha: admin123                         ║
  ╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
