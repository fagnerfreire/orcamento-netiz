const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { auth } = require('../middleware/auth');

// Dashboard principal
router.get('/', auth, (req, res) => {
  const { ano } = req.query;
  const anoFiltro = ano || new Date().getFullYear();

  const dashboard = {
    ano: anoFiltro,
    perfil: req.user.perfil
  };

  // Definir filtro de departamentos baseado no perfil
  let filtroDepto = '';
  let paramsFiltro = [];

  if (req.user.perfil === 'gestor') {
    filtroDepto = ` AND o.departamento_id IN (
      SELECT departamento_id FROM gestor_departamento WHERE usuario_id = ?
    )`;
    paramsFiltro = [req.user.id];
  }

  // Estatísticas gerais
  const promises = [];

  // 1. Totais de orçamento
  promises.push(new Promise((resolve) => {
    db.get(
      `SELECT 
         COUNT(DISTINCT o.id) as total_orcamentos,
         COUNT(DISTINCT CASE WHEN o.status = 'aguardando_aprovacao' THEN o.id END) as aguardando_aprovacao,
         COUNT(DISTINCT CASE WHEN o.status = 'aprovado' THEN o.id END) as aprovados,
         COUNT(DISTINCT CASE WHEN o.status = 'rejeitado' THEN o.id END) as rejeitados
       FROM orcamentos o
       WHERE o.ano = ? ${filtroDepto}`,
      [anoFiltro, ...paramsFiltro],
      (err, totais) => {
        dashboard.totais_orcamentos = totais || {};
        resolve();
      }
    );
  }));

  // 2. Valores orçados vs realizados por departamento
  promises.push(new Promise((resolve) => {
    db.all(
      `SELECT 
         d.id, d.nome,
         SUM(ov.valor_orcado) as total_orcado,
         SUM(ov.valor_realizado) as total_realizado,
         ROUND((SUM(ov.valor_realizado) / NULLIF(SUM(ov.valor_orcado), 0)) * 100, 2) as percentual_execucao
       FROM departamentos d
       INNER JOIN orcamentos o ON d.id = o.departamento_id
       INNER JOIN orcamento_itens oi ON o.id = oi.orcamento_id
       INNER JOIN orcamento_valores ov ON oi.id = ov.item_id
       WHERE o.ano = ? ${filtroDepto}
       GROUP BY d.id, d.nome
       ORDER BY d.nome`,
      [anoFiltro, ...paramsFiltro],
      (err, departamentos) => {
        dashboard.por_departamento = departamentos || [];
        resolve();
      }
    );
  }));

  // 3. Valores por mês (geral)
  promises.push(new Promise((resolve) => {
    db.all(
      `SELECT 
         ov.mes,
         SUM(ov.valor_orcado) as orcado,
         SUM(ov.valor_realizado) as realizado
       FROM orcamento_valores ov
       INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
       INNER JOIN orcamentos o ON oi.orcamento_id = o.id
       WHERE o.ano = ? ${filtroDepto}
       GROUP BY ov.mes
       ORDER BY ov.mes`,
      [anoFiltro, ...paramsFiltro],
      (err, meses) => {
        dashboard.por_mes = meses || [];
        resolve();
      }
    );
  }));

  // 4. Top categorias
  promises.push(new Promise((resolve) => {
    db.all(
      `SELECT 
         c.nome as categoria,
         SUM(ov.valor_orcado) as total_orcado,
         SUM(ov.valor_realizado) as total_realizado
       FROM categorias c
       INNER JOIN orcamento_itens oi ON c.id = oi.categoria_id
       INNER JOIN orcamento_valores ov ON oi.id = ov.item_id
       INNER JOIN orcamentos o ON oi.orcamento_id = o.id
       WHERE o.ano = ? ${filtroDepto}
       GROUP BY c.id, c.nome
       ORDER BY total_orcado DESC
       LIMIT 10`,
      [anoFiltro, ...paramsFiltro],
      (err, categorias) => {
        dashboard.top_categorias = categorias || [];
        resolve();
      }
    );
  }));

  // 5. Contestações pendentes
  if (req.user.perfil !== 'leitura') {
    promises.push(new Promise((resolve) => {
      db.get(
        `SELECT COUNT(*) as total
         FROM contestacoes c
         INNER JOIN orcamento_valores ov ON c.valor_id = ov.id
         INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
         INNER JOIN orcamentos o ON oi.orcamento_id = o.id
         WHERE c.status = 'pendente' ${filtroDepto}`,
        paramsFiltro,
        (err, result) => {
          dashboard.contestacoes_pendentes = result?.total || 0;
          resolve();
        }
      );
    }));
  }

  // 6. Resumo trimestral
  promises.push(new Promise((resolve) => {
    db.all(
      `SELECT 
         CASE 
           WHEN ov.mes IN (1,2,3) THEN 'T1'
           WHEN ov.mes IN (4,5,6) THEN 'T2'
           WHEN ov.mes IN (7,8,9) THEN 'T3'
           ELSE 'T4'
         END as trimestre,
         SUM(ov.valor_orcado) as orcado,
         SUM(ov.valor_realizado) as realizado
       FROM orcamento_valores ov
       INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
       INNER JOIN orcamentos o ON oi.orcamento_id = o.id
       WHERE o.ano = ? ${filtroDepto}
       GROUP BY trimestre
       ORDER BY trimestre`,
      [anoFiltro, ...paramsFiltro],
      (err, trimestres) => {
        dashboard.por_trimestre = trimestres || [];
        resolve();
      }
    );
  }));

  // 7. Totais consolidados
  promises.push(new Promise((resolve) => {
    db.get(
      `SELECT 
         SUM(ov.valor_orcado) as total_orcado_ano,
         SUM(ov.valor_realizado) as total_realizado_ano,
         ROUND((SUM(ov.valor_realizado) / NULLIF(SUM(ov.valor_orcado), 0)) * 100, 2) as percentual_execucao_ano
       FROM orcamento_valores ov
       INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
       INNER JOIN orcamentos o ON oi.orcamento_id = o.id
       WHERE o.ano = ? ${filtroDepto}`,
      [anoFiltro, ...paramsFiltro],
      (err, totais) => {
        dashboard.totais_consolidados = totais || {};
        resolve();
      }
    );
  }));

  // Aguardar todas as consultas
  Promise.all(promises).then(() => {
    res.json(dashboard);
  });
});

// Relatório detalhado de um departamento
router.get('/departamento/:id', auth, (req, res) => {
  const { ano } = req.query;
  const anoFiltro = ano || new Date().getFullYear();

  // Verificar acesso
  if (req.user.perfil === 'gestor') {
    db.get(
      'SELECT 1 FROM gestor_departamento WHERE usuario_id = ? AND departamento_id = ?',
      [req.user.id, req.params.id],
      (err, acesso) => {
        if (!acesso) {
          return res.status(403).json({ erro: 'Acesso negado' });
        }
        gerarRelatorio();
      }
    );
  } else {
    gerarRelatorio();
  }

  function gerarRelatorio() {
    const relatorio = {};

    const promises = [];

    // Dados do departamento
    promises.push(new Promise((resolve) => {
      db.get(
        'SELECT * FROM departamentos WHERE id = ?',
        [req.params.id],
        (err, depto) => {
          relatorio.departamento = depto;
          resolve();
        }
      );
    }));

    // Orçamento do ano
    promises.push(new Promise((resolve) => {
      db.get(
        'SELECT * FROM orcamentos WHERE departamento_id = ? AND ano = ?',
        [req.params.id, anoFiltro],
        (err, orcamento) => {
          relatorio.orcamento = orcamento;
          resolve();
        }
      );
    }));

    // Valores por mês
    promises.push(new Promise((resolve) => {
      db.all(
        `SELECT 
           ov.mes,
           SUM(ov.valor_orcado) as orcado,
           SUM(ov.valor_realizado) as realizado
         FROM orcamento_valores ov
         INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
         INNER JOIN orcamentos o ON oi.orcamento_id = o.id
         WHERE o.departamento_id = ? AND o.ano = ?
         GROUP BY ov.mes
         ORDER BY ov.mes`,
        [req.params.id, anoFiltro],
        (err, meses) => {
          relatorio.por_mes = meses || [];
          resolve();
        }
      );
    }));

    // Por categoria
    promises.push(new Promise((resolve) => {
      db.all(
        `SELECT 
           c.nome as categoria,
           SUM(ov.valor_orcado) as orcado,
           SUM(ov.valor_realizado) as realizado
         FROM orcamento_valores ov
         INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
         LEFT JOIN categorias c ON oi.categoria_id = c.id
         INNER JOIN orcamentos o ON oi.orcamento_id = o.id
         WHERE o.departamento_id = ? AND o.ano = ?
         GROUP BY c.id, c.nome
         ORDER BY orcado DESC`,
        [req.params.id, anoFiltro],
        (err, categorias) => {
          relatorio.por_categoria = categorias || [];
          resolve();
        }
      );
    }));

    // Totais
    promises.push(new Promise((resolve) => {
      db.get(
        `SELECT 
           SUM(ov.valor_orcado) as total_orcado,
           SUM(ov.valor_realizado) as total_realizado,
           ROUND((SUM(ov.valor_realizado) / NULLIF(SUM(ov.valor_orcado), 0)) * 100, 2) as percentual_execucao
         FROM orcamento_valores ov
         INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
         INNER JOIN orcamentos o ON oi.orcamento_id = o.id
         WHERE o.departamento_id = ? AND o.ano = ?`,
        [req.params.id, anoFiltro],
        (err, totais) => {
          relatorio.totais = totais || {};
          resolve();
        }
      );
    }));

    Promise.all(promises).then(() => {
      res.json(relatorio);
    });
  }
});

module.exports = router;
