// Módulo Departamentos - Completo
const Departamentos = (() => {
    let departamentos = [];
    
    const render = async (container) => {
        Utils.showLoading('pageContent');
        
        try {
            departamentos = await API.departamentos.listar();
            
            container.innerHTML = `
                <div class="card-header">
                    <h1>Departamentos</h1>
                    <button class="btn btn-primary" onclick="Departamentos.showNovoModal()">
                        <i class="fas fa-plus"></i> Novo Departamento
                    </button>
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
                                ${departamentos.length === 0 ? `
                                    <tr>
                                        <td colspan="5" style="text-align: center; padding: 2rem;">
                                            Nenhum departamento cadastrado. Clique em "Novo Departamento" para começar.
                                        </td>
                                    </tr>
                                ` : departamentos.map(dep => `
                                    <tr>
                                        <td><strong>${dep.nome}</strong></td>
                                        <td>${dep.tipo || '-'}</td>
                                        <td>${dep.descricao || '-'}</td>
                                        <td>
                                            <span class="status-badge ${dep.ativo ? 'status-aprovado' : 'status-rejeitado'}">
                                                ${dep.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="Departamentos.editar(${dep.id})" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="Departamentos.confirmarExclusao(${dep.id}, '${dep.nome}')" title="Excluir">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Modal Novo/Editar -->
                <div id="modalDepartamento" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="modalTitulo">Novo Departamento</h2>
                            <span class="modal-close" onclick="Departamentos.fecharModal()">&times;</span>
                        </div>
                        <form id="formDepartamento" onsubmit="Departamentos.salvar(event)">
                            <input type="hidden" id="depId" value="">
                            
                            <div class="form-group">
                                <label for="depNome">Nome *</label>
                                <input type="text" id="depNome" required placeholder="Ex: Tecnologia da Informação">
                            </div>
                            
                            <div class="form-group">
                                <label for="depTipo">Tipo</label>
                                <select id="depTipo">
                                    <option value="">Selecione...</option>
                                    <option value="Operacional">Operacional</option>
                                    <option value="Administrativo">Administrativo</option>
                                    <option value="Estratégico">Estratégico</option>
                                    <option value="Suporte">Suporte</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="depDescricao">Descrição</label>
                                <textarea id="depDescricao" rows="3" placeholder="Descrição do departamento..."></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="depAtivo" checked>
                                    Ativo
                                </label>
                            </div>
                            
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" onclick="Departamentos.fecharModal()">Cancelar</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<div class="alert alert-error">Erro ao carregar departamentos: ${error.message}</div>`;
        }
    };
    
    const showNovoModal = () => {
        document.getElementById('modalTitulo').textContent = 'Novo Departamento';
        document.getElementById('depId').value = '';
        document.getElementById('depNome').value = '';
        document.getElementById('depTipo').value = '';
        document.getElementById('depDescricao').value = '';
        document.getElementById('depAtivo').checked = true;
        document.getElementById('modalDepartamento').style.display = 'flex';
    };
    
    const editar = async (id) => {
        try {
            const dep = departamentos.find(d => d.id === id);
            if (!dep) {
                Utils.mostrarAlerta('Departamento não encontrado', 'error');
                return;
            }
            
            document.getElementById('modalTitulo').textContent = 'Editar Departamento';
            document.getElementById('depId').value = dep.id;
            document.getElementById('depNome').value = dep.nome;
            document.getElementById('depTipo').value = dep.tipo || '';
            document.getElementById('depDescricao').value = dep.descricao || '';
            document.getElementById('depAtivo').checked = dep.ativo;
            document.getElementById('modalDepartamento').style.display = 'flex';
        } catch (error) {
            Utils.mostrarAlerta('Erro ao carregar departamento: ' + error.message, 'error');
        }
    };
    
    const salvar = async (event) => {
        event.preventDefault();
        
        const id = document.getElementById('depId').value;
        const dados = {
            nome: document.getElementById('depNome').value.trim(),
            tipo: document.getElementById('depTipo').value,
            descricao: document.getElementById('depDescricao').value.trim(),
            ativo: document.getElementById('depAtivo').checked ? 1 : 0
        };
        
        if (!dados.nome) {
            Utils.mostrarAlerta('Nome é obrigatório', 'warning');
            return;
        }
        
        try {
            if (id) {
                await API.departamentos.atualizar(id, dados);
                Utils.mostrarAlerta('Departamento atualizado com sucesso!', 'success');
            } else {
                await API.departamentos.criar(dados);
                Utils.mostrarAlerta('Departamento criado com sucesso!', 'success');
            }
            
            fecharModal();
            render(document.getElementById('pageContent'));
        } catch (error) {
            Utils.mostrarAlerta('Erro ao salvar: ' + error.message, 'error');
        }
    };
    
    const confirmarExclusao = (id, nome) => {
        if (confirm(`Deseja realmente excluir o departamento "${nome}"?\n\nEsta ação não pode ser desfeita.`)) {
            deletar(id);
        }
    };
    
    const deletar = async (id) => {
        try {
            await API.departamentos.deletar(id);
            Utils.mostrarAlerta('Departamento excluído com sucesso!', 'success');
            render(document.getElementById('pageContent'));
        } catch (error) {
            Utils.mostrarAlerta('Erro ao excluir: ' + error.message, 'error');
        }
    };
    
    const fecharModal = () => {
        document.getElementById('modalDepartamento').style.display = 'none';
    };
    
    return { 
        render, 
        showNovoModal, 
        editar, 
        salvar,
        confirmarExclusao,
        deletar,
        fecharModal
    };
})();
