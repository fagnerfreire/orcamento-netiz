const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../database');
const { auth, checkPerfil } = require('../middleware/auth');

// Listar usuários (apenas admin)
router.get('/', auth, checkPerfil('admin'), (req, res) => {
  db.all(
    `SELECT u.id, u.nome, u.email, u.perfil, u.ativo, u.created_at,
            GROUP_CONCAT(d.nome) as departamentos
     FROM usuarios u
     LEFT JOIN gestor_departamento gd ON u.id = gd.usuario_id
     LEFT JOIN departamentos d ON gd.departamento_id = d.id
     GROUP BY u.id
     ORDER BY u.nome`,
    (err, usuarios) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao listar usuários' });
      }
      res.json(usuarios);
    }
  );
});

// Buscar usuário por ID
router.get('/:id', auth, (req, res) => {
  // Admin pode ver qualquer usuário, outros só podem ver a si mesmos
  if (req.user.perfil !== 'admin' && req.user.id != req.params.id) {
    return res.status(403).json({ erro: 'Acesso negado' });
  }

  db.get(
    `SELECT id, nome, email, perfil, ativo, created_at FROM usuarios WHERE id = ?`,
    [req.params.id],
    (err, usuario) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar usuário' });
      }
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      // Buscar departamentos do gestor
      db.all(
        `SELECT d.id, d.nome FROM departamentos d
         INNER JOIN gestor_departamento gd ON d.id = gd.departamento_id
         WHERE gd.usuario_id = ?`,
        [req.params.id],
        (err, departamentos) => {
          usuario.departamentos = departamentos || [];
          res.json(usuario);
        }
      );
    }
  );
});

// Criar usuário (apenas admin)
router.post('/', auth, checkPerfil('admin'), async (req, res) => {
  const { nome, email, senha, perfil, departamentos } = req.body;

  if (!nome || !email || !senha || !perfil) {
    return res.status(400).json({ erro: 'Todos os campos são obrigatórios' });
  }

  if (!['admin', 'financeiro', 'gestor', 'leitura'].includes(perfil)) {
    return res.status(400).json({ erro: 'Perfil inválido' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  db.run(
    `INSERT INTO usuarios (nome, email, senha, perfil) VALUES (?, ?, ?, ?)`,
    [nome, email, senhaHash, perfil],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ erro: 'Email já cadastrado' });
        }
        return res.status(500).json({ erro: 'Erro ao criar usuário' });
      }

      const usuarioId = this.lastID;

      // Vincular departamentos se for gestor
      if (perfil === 'gestor' && departamentos && departamentos.length > 0) {
        const stmt = db.prepare('INSERT INTO gestor_departamento (usuario_id, departamento_id) VALUES (?, ?)');
        departamentos.forEach(depId => {
          stmt.run(usuarioId, depId);
        });
        stmt.finalize();
      }

      res.status(201).json({ 
        mensagem: 'Usuário criado com sucesso',
        id: usuarioId
      });
    }
  );
});

// Atualizar usuário
router.put('/:id', auth, checkPerfil('admin'), (req, res) => {
  const { nome, email, perfil, ativo, departamentos } = req.body;

  if (!nome || !email || !perfil) {
    return res.status(400).json({ erro: 'Nome, email e perfil são obrigatórios' });
  }

  db.run(
    `UPDATE usuarios SET nome = ?, email = ?, perfil = ?, ativo = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [nome, email, perfil, ativo !== undefined ? ativo : 1, req.params.id],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ erro: 'Email já cadastrado' });
        }
        return res.status(500).json({ erro: 'Erro ao atualizar usuário' });
      }

      // Atualizar departamentos se for gestor
      if (perfil === 'gestor' && departamentos) {
        db.run('DELETE FROM gestor_departamento WHERE usuario_id = ?', [req.params.id], () => {
          if (departamentos.length > 0) {
            const stmt = db.prepare('INSERT INTO gestor_departamento (usuario_id, departamento_id) VALUES (?, ?)');
            departamentos.forEach(depId => {
              stmt.run(req.params.id, depId);
            });
            stmt.finalize();
          }
        });
      }

      res.json({ mensagem: 'Usuário atualizado com sucesso' });
    }
  );
});

// Deletar usuário
router.delete('/:id', auth, checkPerfil('admin'), (req, res) => {
  // Não permitir deletar o próprio usuário
  if (req.user.id == req.params.id) {
    return res.status(400).json({ erro: 'Você não pode deletar sua própria conta' });
  }

  db.run('DELETE FROM usuarios WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ erro: 'Erro ao deletar usuário' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    res.json({ mensagem: 'Usuário deletado com sucesso' });
  });
});

module.exports = router;
