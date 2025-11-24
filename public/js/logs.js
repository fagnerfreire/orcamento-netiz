// Módulo Logs
const Logs = (() => {
    const render = async (container) => {
        Utils.showLoading('pageContent');
        
        try {
            const logs = await API.logs.listar({ limit: 50 });
            
            container.innerHTML = `
                <div class="card-header">
                    <h1><i class="fas fa-history"></i> Logs de Auditoria</h1>
                </div>
                
                <div class="card">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Data/Hora</th>
                                    <th>Usuário</th>
                                    <th>Ação</th>
                                    <th>IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${logs.map(log => `
                                    <tr>
                                        <td>${Utils.formatarDataHora(log.created_at)}</td>
                                        <td>${log.usuario_nome || 'Sistema'}</td>
                                        <td>${log.acao}</td>
                                        <td>${log.ip_address || '-'}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="4" class="text-center">Nenhum log encontrado</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<div class="alert alert-error">Erro: ${error.message}</div>`;
        }
    };
    
    return { render };
})();
