const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { auth, checkPerfil } = require('../middleware/auth');

// Listar departamentos
router.get('/', auth, (req, res) => {
  const { ativo } = req.query;
  
  // Gestor só vê seus departamentos
  if (req.user.perfil === 'gestor') {
    let query = `SELECT DISTINCT d.* FROM departamentos d
                 INNER JOIN gestor_departamento gd ON d.id = gd.departamento_id
                 WHERE gd.usuario_id = ?`;
    let params = [req.user.id];

    if (ativo !== undefined) {
      query += ' AND d.ativo = ?';
      params.push(ativo);
    }

    query += ' ORDER BY d.nome';

    db.all(query, params, (err, departamentos) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao listar departamentos' });
      }
      res.json(departamentos);
    });
  } else {
    // Admin e financeiro veem todos
    let query = 'SELECT * FROM departamentos';
    let params = [];

    if (ativo !== undefined) {
      query += ' WHERE ativo = ?';
      params.push(ativo);
    }

    query += ' ORDER BY nome';

    db.all(query, params, (err, departamentos) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao listar departamentos' });
      }
      res.json(departamentos);
    });
  }
});

// Buscar departamento por ID
router.get('/:id', auth, (req, res) => {
  db.get('SELECT * FROM departamentos WHERE id = ?', [req.params.id], (err, departamento) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar departamento' });
    }
    if (!departamento) {
      return res.status(404).json({ erro: 'Departamento não encontrado' });
    }

    // Buscar gestores
    db.all(
      `SELECT u.id, u.nome, u.email FROM usuarios u
       INNER JOIN gestor_departamento gd ON u.id = gd.usuario_id
       WHERE gd.departamento_id = ?`,
      [req.params.id],
      (err, gestores) => {
        departamento.gestores = gestores || [];
        res.json(departamento);
      }
    );
  });
});

// Criar departamento (admin apenas)
router.post('/', auth, checkPerfil('admin'), (req, res) => {
  const { nome, descricao, departamento_pai_id, ativo, gestores } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome do departamento é obrigatório' });
  }

  db.run(
    'INSERT INTO departamentos (nome, descricao, departamento_pai_id, ativo) VALUES (?, ?, ?, ?)',
    [nome, descricao, departamento_pai_id || null, ativo !== undefined ? ativo : 1],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao criar departamento' });
      }

      const departamentoId = this.lastID;

      // Vincular gestores
      if (gestores && gestores.length > 0) {
        const stmt = db.prepare('INSERT INTO gestor_departamento (usuario_id, departamento_id) VALUES (?, ?)');
        gestores.forEach(gestorId => {
          stmt.run(gestorId, departamentoId);
        });
        stmt.finalize();
      }

      res.status(201).json({ 
        mensagem: 'Departamento criado com sucesso',
        id: departamentoId
      });
    }
  );
});

// Atualizar departamento
router.put('/:id', auth, checkPerfil('admin'), (req, res) => {
  const { nome, descricao, departamento_pai_id, ativo, gestores } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome do departamento é obrigatório' });
  }

  db.run(
    `UPDATE departamentos SET nome = ?, descricao = ?, departamento_pai_id = ?, ativo = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [nome, descricao, departamento_pai_id || null, ativo !== undefined ? ativo : 1, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao atualizar departamento' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Departamento não encontrado' });
      }

      // Atualizar gestores
      if (gestores) {
        db.run('DELETE FROM gestor_departamento WHERE departamento_id = ?', [req.params.id], () => {
          if (gestores.length > 0) {
            const stmt = db.prepare('INSERT INTO gestor_departamento (usuario_id, departamento_id) VALUES (?, ?)');
            gestores.forEach(gestorId => {
              stmt.run(gestorId, req.params.id);
            });
            stmt.finalize();
          }
        });
      }

      res.json({ mensagem: 'Departamento atualizado com sucesso' });
    }
  );
});

// Deletar departamento
router.delete('/:id', auth, checkPerfil('admin'), (req, res) => {
  // Verificar se departamento possui orçamentos
  db.get(
    'SELECT COUNT(*) as total FROM orcamentos WHERE departamento_id = ?',
    [req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao verificar uso do departamento' });
      }

      if (result.total > 0) {
        return res.status(400).json({ 
          erro: 'Departamento não pode ser excluído pois possui orçamentos cadastrados' 
        });
      }

      db.run('DELETE FROM departamentos WHERE id = ?', [req.params.id], function(err) {
        if (err) {
          return res.status(500).json({ erro: 'Erro ao deletar departamento' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ erro: 'Departamento não encontrado' });
        }
        res.json({ mensagem: 'Departamento deletado com sucesso' });
      });
    }
  );
});

module.exports = router;
