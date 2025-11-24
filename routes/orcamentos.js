const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { auth, checkPerfil } = require('../middleware/auth');

// Listar orçamentos
router.get('/', auth, (req, res) => {
  const { ano, departamento_id, status } = req.query;
  
  let query = `
    SELECT o.*, d.nome as departamento_nome, d.tipo as departamento_tipo,
           u.nome as aprovado_por_nome
    FROM orcamentos o
    INNER JOIN departamentos d ON o.departamento_id = d.id
    LEFT JOIN usuarios u ON o.aprovado_por = u.id
    WHERE 1=1
  `;
  let params = [];

  // Gestor só vê orçamentos dos seus departamentos
  if (req.user.perfil === 'gestor') {
    query += ` AND o.departamento_id IN (
      SELECT departamento_id FROM gestor_departamento WHERE usuario_id = ?
    )`;
    params.push(req.user.id);
  }

  if (ano) {
    query += ' AND o.ano = ?';
    params.push(ano);
  }

  if (departamento_id) {
    query += ' AND o.departamento_id = ?';
    params.push(departamento_id);
  }

  if (status) {
    query += ' AND o.status = ?';
    params.push(status);
  }

  query += ' ORDER BY o.ano DESC, d.nome';

  db.all(query, params, (err, orcamentos) => {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao listar orçamentos' });
    }
    res.json(orcamentos);
  });
});

// Buscar orçamento completo por ID
router.get('/:id', auth, (req, res) => {
  // Buscar orçamento
  db.get(
    `SELECT o.*, d.nome as departamento_nome, d.tipo as departamento_tipo,
            u.nome as aprovado_por_nome
     FROM orcamentos o
     INNER JOIN departamentos d ON o.departamento_id = d.id
     LEFT JOIN usuarios u ON o.aprovado_por = u.id
     WHERE o.id = ?`,
    [req.params.id],
    (err, orcamento) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar orçamento' });
      }
      if (!orcamento) {
        return res.status(404).json({ erro: 'Orçamento não encontrado' });
      }

      // Gestor só pode ver orçamento do seu departamento
      if (req.user.perfil === 'gestor') {
        db.get(
          'SELECT 1 FROM gestor_departamento WHERE usuario_id = ? AND departamento_id = ?',
          [req.user.id, orcamento.departamento_id],
          (err, acesso) => {
            if (!acesso) {
              return res.status(403).json({ erro: 'Acesso negado' });
            }
            buscarItens();
          }
        );
      } else {
        buscarItens();
      }

      function buscarItens() {
        // Buscar itens do orçamento com valores
        db.all(
          `SELECT oi.*, c.nome as categoria_nome
           FROM orcamento_itens oi
           LEFT JOIN categorias c ON oi.categoria_id = c.id
           WHERE oi.orcamento_id = ?
           ORDER BY oi.ordem, oi.id`,
          [req.params.id],
          (err, itens) => {
            if (err) {
              return res.status(500).json({ erro: 'Erro ao buscar itens' });
            }

            // Buscar valores mensais de cada item
            const promises = itens.map(item => {
              return new Promise((resolve) => {
                db.all(
                  `SELECT ov.*, u.nome as lancado_por_nome
                   FROM orcamento_valores ov
                   LEFT JOIN usuarios u ON ov.lancado_por = u.id
                   WHERE ov.item_id = ?
                   ORDER BY ov.mes`,
                  [item.id],
                  (err, valores) => {
                    item.valores = valores || [];
                    resolve();
                  }
                );
              });
            });

            Promise.all(promises).then(() => {
              orcamento.itens = itens;
              res.json(orcamento);
            });
          }
        );
      }
    }
  );
});

// Criar orçamento
router.post('/', auth, checkPerfil('admin', 'gestor'), (req, res) => {
  const { departamento_id, ano } = req.body;

  if (!departamento_id || !ano) {
    return res.status(400).json({ erro: 'Departamento e ano são obrigatórios' });
  }

  // Gestor só pode criar orçamento para seus departamentos
  if (req.user.perfil === 'gestor') {
    db.get(
      'SELECT 1 FROM gestor_departamento WHERE usuario_id = ? AND departamento_id = ?',
      [req.user.id, departamento_id],
      (err, acesso) => {
        if (!acesso) {
          return res.status(403).json({ erro: 'Você não tem permissão para este departamento' });
        }
        criarOrcamento();
      }
    );
  } else {
    criarOrcamento();
  }

  function criarOrcamento() {
    db.run(
      'INSERT INTO orcamentos (departamento_id, ano, status) VALUES (?, ?, ?)',
      [departamento_id, ano, 'rascunho'],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ erro: 'Já existe orçamento para este departamento/ano' });
          }
          return res.status(500).json({ erro: 'Erro ao criar orçamento' });
        }
        res.status(201).json({ 
          mensagem: 'Orçamento criado com sucesso',
          id: this.lastID
        });
      }
    );
  }
});

// Adicionar item ao orçamento
router.post('/:id/itens', auth, checkPerfil('admin', 'gestor'), (req, res) => {
  const { categoria_id, descricao, valores } = req.body;

  if (!descricao) {
    return res.status(400).json({ erro: 'Descrição é obrigatória' });
  }

  // Verificar se orçamento existe e se pode ser editado
  db.get(
    'SELECT * FROM orcamentos WHERE id = ?',
    [req.params.id],
    (err, orcamento) => {
      if (err || !orcamento) {
        return res.status(404).json({ erro: 'Orçamento não encontrado' });
      }

      if (orcamento.status === 'aprovado') {
        return res.status(400).json({ erro: 'Orçamento já aprovado não pode ser editado' });
      }

      // Gestor só pode editar orçamento do seu departamento
      if (req.user.perfil === 'gestor') {
        db.get(
          'SELECT 1 FROM gestor_departamento WHERE usuario_id = ? AND departamento_id = ?',
          [req.user.id, orcamento.departamento_id],
          (err, acesso) => {
            if (!acesso) {
              return res.status(403).json({ erro: 'Acesso negado' });
            }
            inserirItem();
          }
        );
      } else {
        inserirItem();
      }

      function inserirItem() {
        db.run(
          'INSERT INTO orcamento_itens (orcamento_id, categoria_id, descricao) VALUES (?, ?, ?)',
          [req.params.id, categoria_id, descricao],
          function(err) {
            if (err) {
              return res.status(500).json({ erro: 'Erro ao adicionar item' });
            }

            const itemId = this.lastID;

            // Inserir valores mensais se fornecidos
            if (valores && Array.isArray(valores)) {
              const stmt = db.prepare(
                'INSERT INTO orcamento_valores (item_id, mes, valor_orcado) VALUES (?, ?, ?)'
              );
              valores.forEach(v => {
                if (v.mes >= 1 && v.mes <= 12) {
                  stmt.run(itemId, v.mes, v.valor_orcado || 0);
                }
              });
              stmt.finalize();
            }

            res.status(201).json({ 
              mensagem: 'Item adicionado com sucesso',
              id: itemId
            });
          }
        );
      }
    }
  );
});

// Atualizar item do orçamento
router.put('/:id/itens/:itemId', auth, checkPerfil('admin', 'gestor'), (req, res) => {
  const { categoria_id, descricao, valores } = req.body;

  // Verificar permissões
  db.get(
    `SELECT o.* FROM orcamentos o
     INNER JOIN orcamento_itens oi ON o.id = oi.orcamento_id
     WHERE oi.id = ?`,
    [req.params.itemId],
    (err, orcamento) => {
      if (err || !orcamento) {
        return res.status(404).json({ erro: 'Item não encontrado' });
      }

      if (orcamento.status === 'aprovado') {
        return res.status(400).json({ erro: 'Orçamento já aprovado não pode ser editado' });
      }

      // Gestor só pode editar seu departamento
      if (req.user.perfil === 'gestor') {
        db.get(
          'SELECT 1 FROM gestor_departamento WHERE usuario_id = ? AND departamento_id = ?',
          [req.user.id, orcamento.departamento_id],
          (err, acesso) => {
            if (!acesso) {
              return res.status(403).json({ erro: 'Acesso negado' });
            }
            atualizarItem();
          }
        );
      } else {
        atualizarItem();
      }

      function atualizarItem() {
        db.run(
          `UPDATE orcamento_itens SET categoria_id = ?, descricao = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [categoria_id, descricao, req.params.itemId],
          (err) => {
            if (err) {
              return res.status(500).json({ erro: 'Erro ao atualizar item' });
            }

            // Atualizar valores se fornecidos
            if (valores && Array.isArray(valores)) {
              valores.forEach(v => {
                if (v.mes >= 1 && v.mes <= 12) {
                  db.run(
                    `INSERT INTO orcamento_valores (item_id, mes, valor_orcado)
                     VALUES (?, ?, ?)
                     ON CONFLICT(item_id, mes) DO UPDATE SET valor_orcado = excluded.valor_orcado`,
                    [req.params.itemId, v.mes, v.valor_orcado || 0]
                  );
                }
              });
            }

            res.json({ mensagem: 'Item atualizado com sucesso' });
          }
        );
      }
    }
  );
});

// Deletar item
router.delete('/:id/itens/:itemId', auth, checkPerfil('admin', 'gestor'), (req, res) => {
  // Verificar permissões
  db.get(
    `SELECT o.* FROM orcamentos o
     INNER JOIN orcamento_itens oi ON o.id = oi.orcamento_id
     WHERE oi.id = ?`,
    [req.params.itemId],
    (err, orcamento) => {
      if (err || !orcamento) {
        return res.status(404).json({ erro: 'Item não encontrado' });
      }

      if (orcamento.status === 'aprovado') {
        return res.status(400).json({ erro: 'Orçamento já aprovado não pode ser editado' });
      }

      if (req.user.perfil === 'gestor') {
        db.get(
          'SELECT 1 FROM gestor_departamento WHERE usuario_id = ? AND departamento_id = ?',
          [req.user.id, orcamento.departamento_id],
          (err, acesso) => {
            if (!acesso) {
              return res.status(403).json({ erro: 'Acesso negado' });
            }
            deletar();
          }
        );
      } else {
        deletar();
      }

      function deletar() {
        db.run('DELETE FROM orcamento_itens WHERE id = ?', [req.params.itemId], (err) => {
          if (err) {
            return res.status(500).json({ erro: 'Erro ao deletar item' });
          }
          res.json({ mensagem: 'Item deletado com sucesso' });
        });
      }
    }
  );
});

// Submeter para aprovação
router.post('/:id/submeter', auth, checkPerfil('gestor'), (req, res) => {
  db.run(
    `UPDATE orcamentos SET status = 'aguardando_aprovacao', updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND status = 'rascunho'`,
    [req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao submeter orçamento' });
      }
      if (this.changes === 0) {
        return res.status(400).json({ erro: 'Orçamento não pode ser submetido' });
      }
      res.json({ mensagem: 'Orçamento submetido para aprovação' });
    }
  );
});

// Aprovar orçamento
router.post('/:id/aprovar', auth, checkPerfil('admin'), (req, res) => {
  const { observacao } = req.body;

  db.run(
    `UPDATE orcamentos 
     SET status = 'aprovado', 
         observacao_aprovacao = ?, 
         aprovado_por = ?,
         aprovado_em = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [observacao, req.user.id, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao aprovar orçamento' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Orçamento não encontrado' });
      }
      res.json({ mensagem: 'Orçamento aprovado com sucesso' });
    }
  );
});

// Rejeitar orçamento
router.post('/:id/rejeitar', auth, checkPerfil('admin'), (req, res) => {
  const { observacao } = req.body;

  if (!observacao) {
    return res.status(400).json({ erro: 'Observação é obrigatória para rejeição' });
  }

  db.run(
    `UPDATE orcamentos 
     SET status = 'rejeitado', 
         observacao_aprovacao = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [observacao, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao rejeitar orçamento' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ erro: 'Orçamento não encontrado' });
      }
      res.json({ mensagem: 'Orçamento rejeitado' });
    }
  );
});

// Lançar valor realizado (financeiro/admin)
router.post('/:id/lancar-realizado', auth, checkPerfil('admin', 'financeiro'), (req, res) => {
  const { item_id, mes, valor_realizado, observacao } = req.body;

  if (!item_id || !mes || valor_realizado === undefined) {
    return res.status(400).json({ erro: 'Item, mês e valor são obrigatórios' });
  }

  db.run(
    `INSERT INTO orcamento_valores (item_id, mes, valor_realizado, observacao_realizado, lancado_por, lancado_em)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(item_id, mes) DO UPDATE SET 
       valor_realizado = excluded.valor_realizado,
       observacao_realizado = excluded.observacao_realizado,
       lancado_por = excluded.lancado_por,
       lancado_em = excluded.lancado_em,
       updated_at = CURRENT_TIMESTAMP`,
    [item_id, mes, valor_realizado, observacao, req.user.id],
    (err) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao lançar valor realizado' });
      }
      res.json({ mensagem: 'Valor realizado lançado com sucesso' });
    }
  );
});

module.exports = router;
