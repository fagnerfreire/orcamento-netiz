const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const BACKUP_DIR = path.join(__dirname, '../backups');
const DB_PATH = path.join(__dirname, '../orcamento.db');

// Criar diretório de backups se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Função para fazer backup
function fazerBackup() {
  return new Promise((resolve, reject) => {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const backupFile = path.join(BACKUP_DIR, `backup_${timestamp}.db`);

    // Copiar arquivo do banco
    fs.copyFile(DB_PATH, backupFile, (err) => {
      if (err) {
        console.error('Erro ao fazer backup:', err);
        reject(err);
        return;
      }

      console.log(`✅ Backup criado: ${backupFile}`);
      
      // Limpar backups antigos (manter apenas últimos 30)
      limparBackupsAntigos();
      
      resolve(backupFile);
    });
  });
}

// Limpar backups antigos
function limparBackupsAntigos(maxBackups = 30) {
  fs.readdir(BACKUP_DIR, (err, files) => {
    if (err) {
      console.error('Erro ao ler diretório de backups:', err);
      return;
    }

    const backups = files
      .filter(f => f.startsWith('backup_') && f.endsWith('.db'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    // Deletar backups excedentes
    if (backups.length > maxBackups) {
      backups.slice(maxBackups).forEach(backup => {
        fs.unlink(backup.path, (err) => {
          if (!err) {
            console.log(`🗑️ Backup antigo removido: ${backup.name}`);
          }
        });
      });
    }
  });
}

// Listar backups disponíveis
function listarBackups() {
  return new Promise((resolve, reject) => {
    fs.readdir(BACKUP_DIR, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      const backups = files
        .filter(f => f.startsWith('backup_') && f.endsWith('.db'))
        .map(f => {
          const stats = fs.statSync(path.join(BACKUP_DIR, f));
          return {
            nome: f,
            caminho: path.join(BACKUP_DIR, f),
            tamanho: stats.size,
            data: stats.mtime
          };
        })
        .sort((a, b) => b.data.getTime() - a.data.getTime());

      resolve(backups);
    });
  });
}

// Restaurar backup
function restaurarBackup(backupFile) {
  return new Promise((resolve, reject) => {
    const backupPath = path.join(BACKUP_DIR, backupFile);

    if (!fs.existsSync(backupPath)) {
      reject(new Error('Backup não encontrado'));
      return;
    }

    // Fazer backup do banco atual antes de restaurar
    const tempBackup = path.join(BACKUP_DIR, `temp_before_restore_${Date.now()}.db`);
    fs.copyFileSync(DB_PATH, tempBackup);

    // Restaurar backup
    fs.copyFile(backupPath, DB_PATH, (err) => {
      if (err) {
        console.error('Erro ao restaurar backup:', err);
        // Restaurar backup temporário em caso de erro
        fs.copyFileSync(tempBackup, DB_PATH);
        fs.unlinkSync(tempBackup);
        reject(err);
        return;
      }

      fs.unlinkSync(tempBackup);
      console.log(`✅ Backup restaurado: ${backupFile}`);
      resolve();
    });
  });
}

// Agendar backup automático (diário às 2h da manhã)
function agendarBackupAutomatico() {
  const agora = new Date();
  const proximoBackup = new Date();
  proximoBackup.setHours(2, 0, 0, 0);

  // Se já passou das 2h, agendar para amanhã
  if (agora > proximoBackup) {
    proximoBackup.setDate(proximoBackup.getDate() + 1);
  }

  const delay = proximoBackup.getTime() - agora.getTime();

  setTimeout(() => {
    fazerBackup();
    // Agendar próximo backup
    setInterval(fazerBackup, 24 * 60 * 60 * 1000); // A cada 24 horas
  }, delay);

  console.log(`📅 Próximo backup automático agendado para: ${proximoBackup.toLocaleString('pt-BR')}`);
}

module.exports = {
  fazerBackup,
  listarBackups,
  restaurarBackup,
  agendarBackupAutomatico,
  BACKUP_DIR
};
