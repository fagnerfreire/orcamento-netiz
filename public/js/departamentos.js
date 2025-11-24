// Módulo Departamentos - Versão Simplificada
const Departamentos = (() => {
    const render = async (container) => {
        Utils.showLoading('pageContent');
        
        try {
            const departamentos = await API.departamentos.listar();
            
            container.innerHTML = `
                <div class="card-header">
                    <h1>Departamentos</h1>
                    <button class="btn btn-primary" onclick="Departamentos.showNovoModal()"><i class="fas fa-plus"></i> Novo Departamento</button>
                </div>
                
                <div class="card">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Tipo</th>
                                    <th>Descrição</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${departamentos.map(dep => `
                                    <tr>
                                        <td><strong>${dep.nome}</strong></td>
                                        <td>${dep.tipo || '-'}</td>
                                        <td>${dep.descricao || '-'}</td>
                                        <td><span class="status-badge ${dep.ativo ? 'status-aprovado' : 'status-rejeitado'}">${dep.ativo ? 'Ativo' : 'Inativo'}</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="Departamentos.editar(${dep.id})"><i class="fas fa-edit"></i></button>
                                            <button class="btn btn-sm btn-danger" onclick="Departamentos.deletar(${dep.id})"><i class="fas fa-trash"></i></button>
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
    
    const showNovoModal = () => { Utils.mostrarAlerta('Em desenvolvimento', 'warning'); };
    const editar = () => { Utils.mostrarAlerta('Em desenvolvimento', 'warning'); };
    const deletar = () => { Utils.mostrarAlerta('Em desenvolvimento', 'warning'); };
    
    return { render, showNovoModal, editar, deletar };
})();
