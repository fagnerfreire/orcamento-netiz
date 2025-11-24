const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { auth } = require('../middleware/auth');

// Listar notificações do usuário
router.get('/', auth, (req, res) => {
  const { lida } = req.query;

  let query = 'SELECT * FROM notificacoes WHERE usuario_id = ?';
  let params = [req.user.id];

  if (lida !== undefined) {
    query += ' AND lida = ?';
    params.push(lida);
  }

  query += ' ORDER BY created_at DESC LIMIT 50';

  db.all(query, params, (err, notificacoes) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao listar notificações' });
    }
    res.json(notificacoes);
  });
});

// Contar notificações não lidas
router.get('/nao-lidas/count', auth, (req, res) => {
  db.get(
    'SELECT COUNT(*) as total FROM notificacoes WHERE usuario_id = ? AND lida = 0',
    [req.user.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao contar notificações' });
      }
      res.json({ total: result.total });
    }
  );
});

// Marcar notificação como lida
router.put('/:id/lida', auth, (req, res) => {
  db.run(
    'UPDATE notificacoes SET lida = 1 WHERE id = ? AND usuario_id = ?',
    [req.params.id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao marcar notificação' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Notificação não encontrada' });
      }
      res.json({ mensagem: 'Notificação marcada como lida' });
    }
  );
});

// Marcar todas como lidas
router.put('/todas/lida', auth, (req, res) => {
  db.run(
    'UPDATE notificacoes SET lida = 1 WHERE usuario_id = ?',
    [req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao marcar notificações' });
      }
      res.json({ mensagem: `${this.changes} notificações marcadas como lidas` });
    }
  );
});

// Deletar notificação
router.delete('/:id', auth, (req, res) => {
  db.run(
    'DELETE FROM notificacoes WHERE id = ? AND usuario_id = ?',
    [req.params.id, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao deletar notificação' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Notificação não encontrada' });
      }
      res.json({ mensagem: 'Notificação deletada com sucesso' });
    }
  );
});

module.exports = router;
