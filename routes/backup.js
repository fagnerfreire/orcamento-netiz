const express = require('express');
const router = express.Router();
const { auth, checkPerfil } = require('../middleware/auth');
const { fazerBackup, listarBackups, restaurarBackup, BACKUP_DIR } = require('../utils/backup');
const path = require('path');

// Listar backups (admin apenas)
router.get('/', auth, checkPerfil('admin'), async (req, res) => {
  try {
    const backups = await listarBackups();
    res.json(backups);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar backups', detalhes: error.message });
  }
});

// Criar novo backup (admin apenas)
router.post('/criar', auth, checkPerfil('admin'), async (req, res) => {
  try {
    const backupFile = await fazerBackup();
    res.json({ 
      mensagem: 'Backup criado com sucesso',
      arquivo: path.basename(backupFile)
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar backup', detalhes: error.message });
  }
});

// Restaurar backup (admin apenas)
router.post('/restaurar', auth, checkPerfil('admin'), async (req, res) => {
  const { arquivo } = req.body;

  if (!arquivo) {
    return res.status(400).json({ erro: 'Nome do arquivo é obrigatório' });
  }

  try {
    await restaurarBackup(arquivo);
    res.json({ mensagem: 'Backup restaurado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao restaurar backup', detalhes: error.message });
  }
});

// Download de backup (admin apenas)
router.get('/download/:arquivo', auth, checkPerfil('admin'), (req, res) => {
  const arquivo = req.params.arquivo;
  const caminhoCompleto = path.join(BACKUP_DIR, arquivo);

  res.download(caminhoCompleto, arquivo, (err) => {
    if (err) {
      res.status(404).json({ erro: 'Arquivo não encontrado' });
    }
  });
});

module.exports = router;
