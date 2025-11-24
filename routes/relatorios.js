const express = require('express');
const router = express.Router();
const { db } = require('../database');
const { auth } = require('../middleware/auth');

// Relatório consolidado por departamento
router.get('/departamento/:id', auth, async (req, res) => {
  const { ano } = req.query;
  const anoFiltro = ano || new Date().getFullYear();
  
  try {
    // Buscar dados do departamento
    const departamento = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM departamentos WHERE id = ?', [req.params.id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!departamento) {
      return res.status(404).json({ erro: 'Departamento não encontrado' });
    }

    // Buscar orçamento
    const orcamento = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM orcamentos WHERE departamento_id = ? AND ano = ?',
        [req.params.id, anoFiltro],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // Buscar valores por mês
    const valoresMensais = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           ov.mes,
           SUM(ov.valor_orcado) as orcado,
           SUM(ov.valor_realizado) as realizado,
           ROUND((SUM(ov.valor_realizado) / NULLIF(SUM(ov.valor_orcado), 0)) * 100, 2) as percentual
         FROM orcamento_valores ov
         INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
         INNER JOIN orcamentos o ON oi.orcamento_id = o.id
         WHERE o.departamento_id = ? AND o.ano = ?
         GROUP BY ov.mes
         ORDER BY ov.mes`,
        [req.params.id, anoFiltro],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Buscar por categoria
    const porCategoria = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           COALESCE(c.nome, 'Sem Categoria') as categoria,
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
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Buscar itens detalhados
    const itensDetalhados = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           oi.descricao,
           c.nome as categoria,
           ov.mes,
           ov.valor_orcado,
           ov.valor_realizado
         FROM orcamento_itens oi
         LEFT JOIN categorias c ON oi.categoria_id = c.id
         INNER JOIN orcamento_valores ov ON oi.id = ov.item_id
         INNER JOIN orcamentos o ON oi.orcamento_id = o.id
         WHERE o.departamento_id = ? AND o.ano = ?
         ORDER BY oi.ordem, oi.id, ov.mes`,
        [req.params.id, anoFiltro],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Totais
    const totais = await new Promise((resolve, reject) => {
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
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json({
      departamento,
      orcamento,
      ano: anoFiltro,
      valoresMensais,
      porCategoria,
      itensDetalhados,
      totais
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório' });
  }
});

// Relatório consolidado geral
router.get('/consolidado', auth, async (req, res) => {
  const { ano } = req.query;
  const anoFiltro = ano || new Date().getFullYear();

  try {
    // Por departamento
    const porDepartamento = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           d.id, d.nome,
           SUM(ov.valor_orcado) as total_orcado,
           SUM(ov.valor_realizado) as total_realizado,
           ROUND((SUM(ov.valor_realizado) / NULLIF(SUM(ov.valor_orcado), 0)) * 100, 2) as percentual
         FROM departamentos d
         INNER JOIN orcamentos o ON d.id = o.departamento_id
         INNER JOIN orcamento_itens oi ON o.id = oi.orcamento_id
         INNER JOIN orcamento_valores ov ON oi.id = ov.item_id
         WHERE o.ano = ?
         GROUP BY d.id, d.nome
         ORDER BY d.nome`,
        [anoFiltro],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Por categoria (geral)
    const porCategoria = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           COALESCE(c.nome, 'Sem Categoria') as categoria,
           SUM(ov.valor_orcado) as orcado,
           SUM(ov.valor_realizado) as realizado
         FROM orcamento_valores ov
         INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
         LEFT JOIN categorias c ON oi.categoria_id = c.id
         INNER JOIN orcamentos o ON oi.orcamento_id = o.id
         WHERE o.ano = ?
         GROUP BY c.id, c.nome
         ORDER BY orcado DESC`,
        [anoFiltro],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Por trimestre
    const porTrimestre = await new Promise((resolve, reject) => {
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
         WHERE o.ano = ?
         GROUP BY trimestre
         ORDER BY trimestre`,
        [anoFiltro],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Totais gerais
    const totais = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
           SUM(ov.valor_orcado) as total_orcado,
           SUM(ov.valor_realizado) as total_realizado,
           ROUND((SUM(ov.valor_realizado) / NULLIF(SUM(ov.valor_orcado), 0)) * 100, 2) as percentual_execucao
         FROM orcamento_valores ov
         INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
         INNER JOIN orcamentos o ON oi.orcamento_id = o.id
         WHERE o.ano = ?`,
        [anoFiltro],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    res.json({
      ano: anoFiltro,
      porDepartamento,
      porCategoria,
      porTrimestre,
      totais
    });

  } catch (error) {
    console.error('Erro ao gerar relatório consolidado:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório consolidado' });
  }
});

// Relatório de variação (orçado vs realizado)
router.get('/variacao', auth, async (req, res) => {
  const { ano, departamento_id } = req.query;
  const anoFiltro = ano || new Date().getFullYear();

  try {
    let whereClause = 'WHERE o.ano = ?';
    let params = [anoFiltro];

    if (departamento_id) {
      whereClause += ' AND o.departamento_id = ?';
      params.push(departamento_id);
    }

    const variacoes = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           d.nome as departamento,
           ov.mes,
           SUM(ov.valor_orcado) as orcado,
           SUM(ov.valor_realizado) as realizado,
           SUM(ov.valor_realizado) - SUM(ov.valor_orcado) as variacao,
           ROUND(((SUM(ov.valor_realizado) - SUM(ov.valor_orcado)) / NULLIF(SUM(ov.valor_orcado), 0)) * 100, 2) as percentual_variacao
         FROM orcamento_valores ov
         INNER JOIN orcamento_itens oi ON ov.item_id = oi.id
         INNER JOIN orcamentos o ON oi.orcamento_id = o.id
         INNER JOIN departamentos d ON o.departamento_id = d.id
         ${whereClause}
         GROUP BY d.id, d.nome, ov.mes
         ORDER BY d.nome, ov.mes`,
        params,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({
      ano: anoFiltro,
      variacoes
    });

  } catch (error) {
    console.error('Erro ao gerar relatório de variação:', error);
    res.status(500).json({ erro: 'Erro ao gerar relatório de variação' });
  }
});

module.exports = router;
