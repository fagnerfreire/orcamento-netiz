const { db } = require('../database');

// Função para registrar log
function registrarLog(usuario_id, acao, detalhes = null, ip = null) {
  db.run(
    `INSERT INTO logs (usuario_id, acao, detalhes, ip_address) 
     VALUES (?, ?, ?, ?)`,
    [usuario_id, acao, JSON.stringify(detalhes), ip],
    (err) => {
      if (err) {
        console.error('Erro ao registrar log:', err);
      }
    }
  );
}

// Middleware para logar ações
function loggerMiddleware(acao) {
  return (req, res, next) => {
    // Salvar a função original send
    const originalSend = res.send;
    
    res.send = function(data) {
      // Registrar log apenas se a requisição foi bem-sucedida
      if (res.statusCode < 400) {
        const detalhes = {
          metodo: req.method,
          url: req.originalUrl,
          body: req.body,
          params: req.params,
          query: req.query
        };
        
        const ip = req.ip || req.connection.remoteAddress;
        registrarLog(req.user?.id, acao, detalhes, ip);
      }
      
      // Chamar a função original
      originalSend.call(this, data);
    };
    
    next();
  };
}

module.exports = { registrarLog, loggerMiddleware };
