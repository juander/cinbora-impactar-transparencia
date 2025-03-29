const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuração
const backupDir = '/app/backups';
const dbUrl = process.env.DATABASE_URL;
const dbName = 'mongo'; // Nome do banco de dados
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `backup-${timestamp}`);

// Criar diretório de backup se não existir
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Executar o backup utilizando mongodump
console.log(`Iniciando backup para ${backupPath}`);
exec(`mongodump --uri="${dbUrl}" --out=${backupPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro no backup: ${error.message}`);
    return;
  }
  
  console.log(`Backup concluído com sucesso: ${backupPath}`);
  
  // Limpar backups antigos (manter apenas os 5 mais recentes)
  fs.readdir(backupDir, (err, files) => {
    if (err) {
      console.error(`Erro ao ler diretório de backups: ${err.message}`);
      return;
    }
    
    // Filtrar apenas diretórios de backup e ordenar por data (mais antigos primeiro)
    const backupDirs = files
      .filter(file => file.startsWith('backup-'))
      .map(file => ({ name: file, path: path.join(backupDir, file) }))
      .sort((a, b) => fs.statSync(a.path).mtime - fs.statSync(b.path).mtime);
    
    // Remover backups antigos se tivermos mais que 5
    if (backupDirs.length > 5) {
      const toDelete = backupDirs.slice(0, backupDirs.length - 5);
      toDelete.forEach(dir => {
        console.log(`Removendo backup antigo: ${dir.path}`);
        exec(`rm -rf ${dir.path}`);
      });
    }
  });
});
