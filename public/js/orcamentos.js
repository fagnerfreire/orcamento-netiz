// Módulo Orçamentos - Versão Simplificada
const Orcamentos = (() => {
    const render = async (container) => {
        Utils.showLoading('pageContent');
        
        try {
            const anoAtual = new Date().getFullYear();
            const orcamentos = await API.orcamentos.listar({ ano: anoAtual });
            
            container.innerHTML = `
                <div class="card-header">
                    <h1>Orçamentos ${anoAtual}</h1>
                    ${Auth.hasPerfil('admin', 'gestor') ? '<button class="btn btn-primary" onclick="Orcamentos.showNovoModal()"><i class="fas fa-plus"></i> Novo Orçamento</button>' : ''}
                </div>
                
                <div class="card">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Departamento</th>
                                    <th>Ano</th>
                                    <th>Status</th>
                                    <th>Aprovado Por</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orcamentos.map(orc => `
                                    <tr>
                                        <td><strong>${orc.departamento_nome}</strong></td>
                                        <td>${orc.ano}</td>
                                        <td><span class="status-badge ${Utils.getStatusClass(orc.status)}">${Utils.traduzirStatus(orc.status)}</span></td>
                                        <td>${orc.aprovado_por_nome || '-'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="Orcamentos.showDetalhes(${orc.id})">
                                                <i class="fas fa-eye"></i> Ver
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<div class="alert alert-error">Erro: ${error.message}</div>`;
        }
    };
    
    const showNovoModal = () => {
        Utils.mostrarAlerta('Funcionalidade em desenvolvimento', 'warning');
    };
    
    const showDetalhes = () => {
        Utils.mostrarAlerta('Funcionalidade em desenvolvimento', 'warning');
    };
    
    return { render, showNovoModal, showDetalhes };
})();
