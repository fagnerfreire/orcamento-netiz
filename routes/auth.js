const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const { auth } = require('../middleware/auth');

// Login
router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  db.get(
    'SELECT * FROM usuarios WHERE email = ? AND ativo = 1',
    [email],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ erro: 'Erro ao buscar usuário' });
      }

      if (!user) {
        return res.status(401).json({ erro: 'Email ou senha inválidos' });
      }

      const senhaValida = await bcrypt.compare(senha, user.senha);
      
      if (!senhaValida) {
        return res.status(401).json({ erro: 'Email ou senha inválidos' });
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          perfil: user.perfil,
          nome: user.nome
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        token,
        usuario: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          perfil: user.perfil
        }
      });
    }
  );
});

// Verificar token
router.get('/verificar', auth, (req, res) => {
  res.json({ valido: true, usuario: req.user });
});

// Alterar senha
router.post('/alterar-senha', auth, async (req, res) => {
  const { senhaAtual, novaSenha } = req.body;

  if (!senhaAtual || !novaSenha) {
    return res.status(400).json({ erro: 'Senhas são obrigatórias' });
  }

  if (novaSenha.length < 6) {
    return res.status(400).json({ erro: 'Nova senha deve ter no mínimo 6 caracteres' });
  }

  db.get(
    'SELECT senha FROM usuarios WHERE id = ?',
    [req.user.id],
    async (err, user) => {
      if (err || !user) {
        return res.status(500).json({ erro: 'Erro ao buscar usuário' });
      }

      const senhaValida = await bcrypt.compare(senhaAtual, user.senha);
      
      if (!senhaValida) {
        return res.status(401).json({ erro: 'Senha atual incorreta' });
      }

      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      db.run(
        'UPDATE usuarios SET senha = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [novaSenhaHash, req.user.id],
        (err) => {
          if (err) {
            return res.status(500).json({ erro: 'Erro ao alterar senha' });
          }
          res.json({ mensagem: 'Senha alterada com sucesso' });
        }
      );
    }
  );
});

module.exports = router;
