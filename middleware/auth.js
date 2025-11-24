const jwt = require('jsonwebtoken');

// Middleware de autenticação
function auth(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ erro: 'Token inválido.' });
  }
}

// Middleware para verificar perfil específico
function checkPerfil(...perfisPermitidos) {
  return (req, res, next) => {
    if (!perfisPermitidos.includes(req.user.perfil)) {
      return res.status(403).json({ 
        erro: 'Acesso negado. Você não tem permissão para esta ação.' 
      });
    }
    next();
  };
}

module.exports = { auth, checkPerfil };
