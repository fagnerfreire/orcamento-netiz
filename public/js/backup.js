// Módulo Backup
const Backup = (() => {
    const render = async (container) => {
        Utils.showLoading('pageContent');
        
        try {
            const backups = await API.backup.listar();
            
            container.innerHTML = `
                <div class="card-header">
                    <h1><i class="fas fa-database"></i> Backup do Sistema</h1>
                    <button class="btn btn-primary" onclick="Backup.criarBackup()">
                        <i class="fas fa-plus"></i> Criar Backup Agora
                    </button>
                </div>
                
                <div class="card">
                    <div class="alert alert-warning">
                        <i class="fas fa-info-circle"></i> 
                        <strong>Backup Automático Ativado:</strong> O sistema faz backup automático diariamente às 2h da manhã.
                        Os últimos 30 backups são mantidos automaticamente.
                    </div>
                    
                    <h3>Backups Disponíveis</h3>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome do Arquivo</th>
                                    <th>Data</th>
                                    <th>Tamanho</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${backups.map(backup => `
                                    <tr>
                                        <td><strong>${backup.nome}</strong></td>
                                        <td>${Utils.formatarDataHora(backup.data)}</td>
                                        <td>${(backup.tamanho / 1024).toFixed(2)} KB</td>
                                        <td>
                                            <button class="btn btn-sm btn-secondary" onclick="Backup.download('${backup.nome}')">
                                                <i class="fas fa-download"></i> Download
                                            </button>
                                            <button class="btn btn-sm btn-primary" onclick="Backup.restaurar('${backup.nome}')">
                                                <i class="fas fa-undo"></i> Restaurar
                                            </button>
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="4" class="text-center">Nenhum backup encontrado</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<div class="alert alert-error">Erro: ${error.message}</div>`;
        }
    };
    
    const criarBackup = async () => {
        if (!confirm('Deseja criar um novo backup agora?')) return;
        
        try {
            Utils.mostrarAlerta('Criando backup...', 'warning');
            await API.backup.criar();
            Utils.mostrarAlerta('Backup criado com sucesso!', 'success');
            // Recarregar página
            App.loadPage('backup');
        } catch (error) {
            Utils.mostrarAlerta('Erro ao criar backup: ' + error.message, 'error');
        }
    };
    
    const download = (arquivo) => {
        window.open(API.backup.download(arquivo), '_blank');
    };
    
    const restaurar = async (arquivo) => {
        if (!confirm(`ATENÇÃO: Esta ação irá restaurar o banco de dados para o estado do backup "${arquivo}".\n\nTodos os dados atuais serão substituídos!\n\nDeseja continuar?`)) {
            return;
        }
        
        try {
            Utils.mostrarAlerta('Restaurando backup...', 'warning');
            await API.backup.restaurar(arquivo);
            Utils.mostrarAlerta('Backup restaurado! O sistema será recarregado...', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            Utils.mostrarAlerta('Erro ao restaurar backup: ' + error.message, 'error');
        }
    };
    
    return { render, criarBackup, download, restaurar };
})();
