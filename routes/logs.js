const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { auth, checkPerfil } = require('../middleware/auth');

// Listar logs (admin apenas)
router.get('/', auth, checkPerfil('admin'), (req, res) => {
  const { usuario_id, acao, data_inicio, data_fim, limit = 100 } = req.query;
  
  let query = `
    SELECT l.*, u.nome as usuario_nome, u.email as usuario_email
    FROM logs l
    LEFT JOIN usuarios u ON l.usuario_id = u.id
    WHERE 1=1
  `;
  let params = [];

  if (usuario_id) {
    query += ' AND l.usuario_id = ?';
    params.push(usuario_id);
  }

  if (acao) {
    query += ' AND l.acao LIKE ?';
    params.push(`%${acao}%`);
  }

  if (data_inicio) {
    query += ' AND l.created_at >= ?';
    params.push(data_inicio);
  }

  if (data_fim) {
    query += ' AND l.created_at <= ?';
    params.push(data_fim);
  }

  query += ' ORDER BY l.created_at DESC LIMIT ?';
  params.push(parseInt(limit));

  db.all(query, params, (err, logs) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao listar logs' });
    }
    res.json(logs);
  });
});

// Buscar log específico
router.get('/:id', auth, checkPerfil('admin'), (req, res) => {
  db.get(
    `SELECT l.*, u.nome as usuario_nome, u.email as usuario_email
     FROM logs l
     LEFT JOIN usuarios u ON l.usuario_id = u.id
     WHERE l.id = ?`,
    [req.params.id],
    (err, log) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar log' });
      }
      if (!log) {
        return res.status(404).json({ erro: 'Log não encontrado' });
      }
      res.json(log);
    }
  );
});

// Estatísticas de logs
router.get('/stats/resumo', auth, checkPerfil('admin'), (req, res) => {
  const { data_inicio, data_fim } = req.query;
  
  let whereClause = '';
  let params = [];

  if (data_inicio && data_fim) {
    whereClause = 'WHERE created_at >= ? AND created_at <= ?';
    params = [data_inicio, data_fim];
  }

  const queries = {
    total: `SELECT COUNT(*) as total FROM logs ${whereClause}`,
    porAcao: `SELECT acao, COUNT(*) as total FROM logs ${whereClause} GROUP BY acao ORDER BY total DESC LIMIT 10`,
    porUsuario: `SELECT u.nome, COUNT(*) as total FROM logs l 
                 LEFT JOIN usuarios u ON l.usuario_id = u.id 
                 ${whereClause} GROUP BY l.usuario_id ORDER BY total DESC LIMIT 10`,
    porDia: `SELECT DATE(created_at) as dia, COUNT(*) as total FROM logs 
             ${whereClause} GROUP BY DATE(created_at) ORDER BY dia DESC LIMIT 30`
  };

  const stats = {};
  const promises = [];

  Object.keys(queries).forEach(key => {
    promises.push(new Promise((resolve) => {
      db.all(queries[key], params, (err, result) => {
        stats[key] = err ? [] : result;
        resolve();
      });
    }));
  });

  Promise.all(promises).then(() => {
    res.json(stats);
  });
});

module.exports = router;
