const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const { db } = require('../database');
const { auth, checkPerfil } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

// Listar categorias
router.get('/', auth, (req, res) => {
  const { ativo } = req.query;
  let query = 'SELECT * FROM categorias';
  let params = [];

  if (ativo !== undefined) {
    query += ' WHERE ativo = ?';
    params.push(ativo);
  }

  query += ' ORDER BY nome';

  db.all(query, params, (err, categorias) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao listar categorias' });
    }
    res.json(categorias);
  });
});

// Buscar categoria por ID
router.get('/:id', auth, (req, res) => {
  db.get('SELECT * FROM categorias WHERE id = ?', [req.params.id], (err, categoria) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar categoria' });
    }
    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria não encontrada' });
    }
    res.json(categoria);
  });
});

// Criar categoria (admin apenas)
router.post('/', auth, checkPerfil('admin'), (req, res) => {
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome da categoria é obrigatório' });
  }

  db.run(
    'INSERT INTO categorias (nome, descricao) VALUES (?, ?)',
    [nome, descricao],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ erro: 'Categoria já cadastrada' });
        }
        return res.status(500).json({ erro: 'Erro ao criar categoria' });
      }
      res.status(201).json({ 
        mensagem: 'Categoria criada com sucesso',
        id: this.lastID
      });
    }
  );
});

// Atualizar categoria
router.put('/:id', auth, checkPerfil('admin'), (req, res) => {
  const { nome, descricao, ativo } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome da categoria é obrigatório' });
  }

  db.run(
    `UPDATE categorias SET nome = ?, descricao = ?, ativo = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [nome, descricao, ativo !== undefined ? ativo : 1, req.params.id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ erro: 'Categoria já cadastrada' });
        }
        return res.status(500).json({ erro: 'Erro ao atualizar categoria' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Categoria não encontrada' });
      }
      res.json({ mensagem: 'Categoria atualizada com sucesso' });
    }
  );
});

// Deletar categoria
router.delete('/:id', auth, checkPerfil('admin'), (req, res) => {
  // Verificar se categoria está sendo usada
  db.get(
    'SELECT COUNT(*) as total FROM orcamento_itens WHERE categoria_id = ?',
    [req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao verificar uso da categoria' });
      }

      if (result.total > 0) {
        return res.status(400).json({ 
          erro: 'Categoria não pode ser excluída pois está sendo usada em orçamentos' 
        });
      }

      db.run('DELETE FROM categorias WHERE id = ?', [req.params.id], function(err) {
        if (err) {
          return res.status(500).json({ erro: 'Erro ao deletar categoria' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ erro: 'Categoria não encontrada' });
        }
        res.json({ mensagem: 'Categoria deletada com sucesso' });
      });
    }
  );
});

// Importar categorias de planilha
router.post('/importar', auth, checkPerfil('admin'), upload.single('arquivo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ erro: 'Arquivo não fornecido' });
    }

    const workbook = xlsx.read(req.file.buffer);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    let importadas = 0;
    let erros = [];

    const stmt = db.prepare('INSERT OR IGNORE INTO categorias (nome, descricao) VALUES (?, ?)');

    data.forEach((row, index) => {
      const nome = row.nome || row.Nome || row.NOME || row.Categoria || row.categoria;
      const descricao = row.descricao || row.Descricao || row.DESCRICAO || '';

      if (nome) {
        stmt.run(nome, descricao, function(err) {
          if (!err && this.changes > 0) {
            importadas++;
          } else if (err) {
            erros.push(`Linha ${index + 2}: ${err.message}`);
          }
        });
      }
    });

    stmt.finalize((err) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao importar categorias' });
      }
      res.json({ 
        mensagem: `Importação concluída`,
        importadas,
        totalLinhas: data.length,
        erros: erros.length > 0 ? erros : undefined
      });
    });

  } catch (error) {
    res.status(500).json({ erro: 'Erro ao processar arquivo', detalhes: error.message });
  }
});

module.exports = router;
