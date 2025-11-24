const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'orcamento.db');
const db = new sqlite3.Database(dbPath);

// Inicializar banco de dados
function initDatabase() {
  db.serialize(() => {
    
    // Tabela de Usuários
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      perfil TEXT NOT NULL CHECK(perfil IN ('admin', 'financeiro', 'gestor', 'leitura')),
      ativo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de Categorias
    db.run(`CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      descricao TEXT,
      ativo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de Departamentos
    db.run(`CREATE TABLE IF NOT EXISTS departamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT,
      tipo TEXT,
      ativo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de Vinculo Gestor-Departamento
    db.run(`CREATE TABLE IF NOT EXISTS gestor_departamento (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      departamento_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
      UNIQUE(usuario_id, departamento_id)
    )`);

    // Tabela de Períodos de Orçamento
    db.run(`CREATE TABLE IF NOT EXISTS periodos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ano INTEGER NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('anual', 'trimestre_1', 'trimestre_2', 'trimestre_3', 'trimestre_4')),
      status TEXT NOT NULL CHECK(status IN ('aberto', 'fechado')) DEFAULT 'fechado',
      data_abertura DATETIME,
      data_fechamento DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(ano, tipo)
    )`);

    // Tabela de Orçamentos
    db.run(`CREATE TABLE IF NOT EXISTS orcamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      departamento_id INTEGER NOT NULL,
      ano INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('rascunho', 'aguardando_aprovacao', 'aprovado', 'rejeitado', 'em_revisao')) DEFAULT 'rascunho',
      observacao_aprovacao TEXT,
      aprovado_por INTEGER,
      aprovado_em DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (departamento_id) REFERENCES departamentos(id) ON DELETE CASCADE,
      FOREIGN KEY (aprovado_por) REFERENCES usuarios(id),
      UNIQUE(departamento_id, ano)
    )`);

    // Tabela de Itens do Orçamento
    db.run(`CREATE TABLE IF NOT EXISTS orcamento_itens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orcamento_id INTEGER NOT NULL,
      categoria_id INTEGER,
      descricao TEXT NOT NULL,
      ordem INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orcamento_id) REFERENCES orcamentos(id) ON DELETE CASCADE,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
    )`);

    // Tabela de Valores Mensais (Orçado e Realizado)
    db.run(`CREATE TABLE IF NOT EXISTS orcamento_valores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      mes INTEGER NOT NULL CHECK(mes >= 1 AND mes <= 12),
      valor_orcado REAL DEFAULT 0,
      valor_realizado REAL DEFAULT 0,
      observacao_realizado TEXT,
      lancado_por INTEGER,
      lancado_em DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES orcamento_itens(id) ON DELETE CASCADE,
      FOREIGN KEY (lancado_por) REFERENCES usuarios(id),
      UNIQUE(item_id, mes)
    )`);

    // Tabela de Contestações
    db.run(`CREATE TABLE IF NOT EXISTS contestacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      valor_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      motivo TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pendente', 'analisando', 'resolvido', 'rejeitado')) DEFAULT 'pendente',
      resposta TEXT,
      resolvido_por INTEGER,
      resolvido_em DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (valor_id) REFERENCES orcamento_valores(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (resolvido_por) REFERENCES usuarios(id)
    )`);

    // Tabela de Logs de Auditoria
    db.run(`CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      acao TEXT NOT NULL,
      detalhes TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
    )`);

    // Tabela de Notificações
    db.run(`CREATE TABLE IF NOT EXISTS notificacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      titulo TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      link TEXT,
      lida INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )`);

    // Criar usuário admin padrão
    const senhaHash = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO usuarios (nome, email, senha, perfil) 
            VALUES (?, ?, ?, ?)`, 
            ['Administrador', 'admin@netiz.com.br', senhaHash, 'admin'],
            (err) => {
              if (!err) {
                console.log('✅ Usuário admin criado: admin@netiz.com.br / admin123');
              }
            });

    console.log('✅ Banco de dados inicializado com sucesso!');
  });
}

module.exports = { db, initDatabase };
