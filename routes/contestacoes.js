const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { auth, checkPerfil } = require('../middleware/auth');

// Criar notificação
function criarNotificacao(usuario_id, tipo, titulo, mensagem, link) {
  db.run(
    'INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem, link) VALUES (?, ?, ?, ?, ?)',
    [usuario_id, tipo, titulo, mensagem, link]
  );
}

// Listar contestações
router.get('/', auth, (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT c.*, 
           u.nome as usuario_nome,
           r.nome as resolvido_por_nome,
           ov.mes, ov.valor_realizado,
           oi.descricao as item_descricao,
           o.ano, o.departamento_id,
           d.nome as departamento_nome
    FROM contestacoes c
    INNER JOIN usuarios u ON c.usuario_id = u.id
    LEFT JOIN usuarios r ON c.resolvido_por = r.id
    INNER JOIN orcamento_valores ov ON c.valor_id = ov.id
    INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
    INNER JOIN orcamentos o ON oi.orcamento_id = o.id
    INNER JOIN departamentos d ON o.departamento_id = d.id
    WHERE 1=1
  `;
  let params = [];

  // Gestor só vê contestações dos seus departamentos
  if (req.user.perfil === 'gestor') {
    query += ` AND o.departamento_id IN (
      SELECT departamento_id FROM gestor_departamento WHERE usuario_id = ?
    )`;
    params.push(req.user.id);
  }

  if (status) {
    query += ' AND c.status = ?';
    params.push(status);
  }

  query += ' ORDER BY c.created_at DESC';

  db.all(query, params, (err, contestacoes) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao listar contestações' });
    }
    res.json(contestacoes);
  });
});

// Buscar contestação por ID
router.get('/:id', auth, (req, res) => {
  db.get(
    `SELECT c.*, 
            u.nome as usuario_nome,
            r.nome as resolvido_por_nome,
            ov.mes, ov.valor_realizado, ov.observacao_realizado,
            oi.descricao as item_descricao,
            o.ano, o.departamento_id,
            d.nome as departamento_nome
     FROM contestacoes c
     INNER JOIN usuarios u ON c.usuario_id = u.id
     LEFT JOIN usuarios r ON c.resolvido_por = r.id
     INNER JOIN orcamento_valores ov ON c.valor_id = ov.id
     INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
     INNER JOIN orcamentos o ON oi.orcamento_id = o.id
     INNER JOIN departamentos d ON o.departamento_id = d.id
     WHERE c.id = ?`,
    [req.params.id],
    (err, contestacao) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar contestação' });
      }
      if (!contestacao) {
        return res.status(404).json({ erro: 'Contestação não encontrada' });
      }
      res.json(contestacao);
    }
  );
});

// Criar contestação (gestor)
router.post('/', auth, checkPerfil('gestor'), (req, res) => {
  const { valor_id, motivo } = req.body;

  if (!valor_id || !motivo) {
    return res.status(400).json({ erro: 'Valor e motivo são obrigatórios' });
  }

  // Verificar se gestor tem acesso ao departamento
  db.get(
    `SELECT o.departamento_id, d.nome as departamento_nome,
            ov.mes, ov.valor_realizado,
            oi.descricao as item_descricao
     FROM orcamento_valores ov
     INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
     INNER JOIN orcamentos o ON oi.orcamento_id = o.id
     INNER JOIN departamentos d ON o.departamento_id = d.id
     WHERE ov.id = ?`,
    [valor_id],
    (err, valor) => {
      if (err || !valor) {
        return res.status(404).json({ erro: 'Valor não encontrado' });
      }

      db.get(
        'SELECT 1 FROM gestor_departamento WHERE usuario_id = ? AND departamento_id = ?',
        [req.user.id, valor.departamento_id],
        (err, acesso) => {
          if (!acesso) {
            return res.status(403).json({ erro: 'Acesso negado' });
          }

          // Criar contestação
          db.run(
            'INSERT INTO contestacoes (valor_id, usuario_id, motivo, status) VALUES (?, ?, ?, ?)',
            [valor_id, req.user.id, motivo, 'pendente'],
            function(err) {
              if (err) {
                return res.status(500).json({ erro: 'Erro ao criar contestação' });
              }

              // Notificar admin e financeiro
              db.all(
                `SELECT id FROM usuarios WHERE perfil IN ('admin', 'financeiro') AND ativo = 1`,
                (err, usuarios) => {
                  usuarios.forEach(u => {
                    criarNotificacao(
                      u.id,
                      'contestacao',
                      'Nova Contestação',
                      `${req.user.nome} contestou um valor realizado do departamento ${valor.departamento_nome}`,
                      `/contestacoes/${this.lastID}`
                    );
                  });
                }
              );

              res.status(201).json({ 
                mensagem: 'Contestação criada com sucesso',
                id: this.lastID
              });
            }
          );
        }
      );
    }
  );
});

// Atualizar status da contestação (admin/financeiro)
router.put('/:id', auth, checkPerfil('admin', 'financeiro'), (req, res) => {
  const { status, resposta } = req.body;

  if (!status) {
    return res.status(400).json({ erro: 'Status é obrigatório' });
  }

  const statusValidos = ['pendente', 'analisando', 'resolvido', 'rejeitado'];
  if (!statusValidos.includes(status)) {
    return res.status(400).json({ erro: 'Status inválido' });
  }

  let query, params;

  if (status === 'resolvido' || status === 'rejeitado') {
    query = `UPDATE contestacoes 
             SET status = ?, resposta = ?, resolvido_por = ?, resolvido_em = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`;
    params = [status, resposta, req.user.id, req.params.id];
  } else {
    query = `UPDATE contestacoes 
             SET status = ?, resposta = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`;
    params = [status, resposta, req.params.id];
  }

  db.run(query, params, function(err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao atualizar contestação' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Contestação não encontrada' });
    }

    // Notificar o gestor que criou a contestação
    db.get(
      'SELECT usuario_id FROM contestacoes WHERE id = ?',
      [req.params.id],
      (err, contestacao) => {
        if (contestacao) {
          criarNotificacao(
            contestacao.usuario_id,
            'contestacao_resposta',
            'Contestação Atualizada',
            `Sua contestação foi ${status === 'resolvido' ? 'resolvida' : status === 'rejeitado' ? 'rejeitada' : 'atualizada'}`,
            `/contestacoes/${req.params.id}`
          );
        }
      }
    );

    res.json({ mensagem: 'Contestação atualizada com sucesso' });
  });
});

// Deletar contestação (admin)
router.delete('/:id', auth, checkPerfil('admin'), (req, res) => {
  db.run('DELETE FROM contestacoes WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao deletar contestação' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Contestação não encontrada' });
    }
    res.json({ mensagem: 'Contestação deletada com sucesso' });
  });
});

module.exports = router;
