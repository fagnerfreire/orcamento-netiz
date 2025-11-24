const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { auth, checkPerfil } = require('../middleware/auth');

// Listar períodos
router.get('/', auth, (req, res) => {
  const { ano } = req.query;
  let query = 'SELECT * FROM periodos';
  let params = [];

  if (ano) {
    query += ' WHERE ano = ?';
    params.push(ano);
  }

  query += ' ORDER BY ano DESC, tipo';

  db.all(query, params, (err, periodos) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao listar períodos' });
    }
    res.json(periodos);
  });
});

// Buscar período por ID
router.get('/:id', auth, (req, res) => {
  db.get('SELECT * FROM periodos WHERE id = ?', [req.params.id], (err, periodo) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao buscar período' });
    }
    if (!periodo) {
      return res.status(404).json({ erro: 'Período não encontrado' });
    }
    res.json(periodo);
  });
});

// Criar ou atualizar período (admin apenas)
router.post('/', auth, checkPerfil('admin'), (req, res) => {
  const { ano, tipo, status } = req.body;

  if (!ano || !tipo) {
    return res.status(400).json({ erro: 'Ano e tipo são obrigatórios' });
  }

  const tiposValidos = ['anual', 'trimestre_1', 'trimestre_2', 'trimestre_3', 'trimestre_4'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ erro: 'Tipo inválido' });
  }

  const dataAtual = new Date().toISOString();

  db.run(
    `INSERT INTO periodos (ano, tipo, status, data_abertura, data_fechamento)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(ano, tipo) DO UPDATE SET 
       status = excluded.status,
       data_abertura = CASE WHEN excluded.status = 'aberto' THEN ? ELSE data_abertura END,
       data_fechamento = CASE WHEN excluded.status = 'fechado' THEN ? ELSE data_fechamento END,
       updated_at = CURRENT_TIMESTAMP`,
    [ano, tipo, status || 'fechado', status === 'aberto' ? dataAtual : null, status === 'fechado' ? dataAtual : null, dataAtual, dataAtual],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao salvar período' });
      }
      res.json({ 
        mensagem: 'Período salvo com sucesso',
        id: this.lastID
      });
    }
  );
});

// Abrir período (admin apenas)
router.post('/:id/abrir', auth, checkPerfil('admin'), (req, res) => {
  const dataAtual = new Date().toISOString();

  db.run(
    `UPDATE periodos SET status = 'aberto', data_abertura = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [dataAtual, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao abrir período' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Período não encontrado' });
      }
      res.json({ mensagem: 'Período aberto com sucesso' });
    }
  );
});

// Fechar período (admin apenas)
router.post('/:id/fechar', auth, checkPerfil('admin'), (req, res) => {
  const dataAtual = new Date().toISOString();

  db.run(
    `UPDATE periodos SET status = 'fechado', data_fechamento = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [dataAtual, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao fechar período' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Período não encontrado' });
      }
      res.json({ mensagem: 'Período fechado com sucesso' });
    }
  );
});

// Deletar período
router.delete('/:id', auth, checkPerfil('admin'), (req, res) => {
  db.run('DELETE FROM periodos WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao deletar período' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Período não encontrado' });
    }
    res.json({ mensagem: 'Período deletado com sucesso' });
  });
});

module.exports = router;
