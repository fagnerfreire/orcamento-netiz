// Módulo Categorias - Completo
const Categorias = (() => {
    let categorias = [];
    
    const render = async (container) => {
        Utils.showLoading('pageContent');
        
        try {
            categorias = await API.categorias.listar();
            
            container.innerHTML = `
                <div class="card-header">
                    <h1>Categorias de Orçamento</h1>
                    <button class="btn btn-primary" onclick="Categorias.showNovoModal()">
                        <i class="fas fa-plus"></i> Nova Categoria
                    </button>
                </div>
                
                <div class="card">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Descrição</th>
                                    <th>Status</th>
                                    <th>Criado em</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${categorias.length === 0 ? `
                                    <tr>
                                        <td colspan="5" style="text-align: center; padding: 2rem;">
                                            Nenhuma categoria cadastrada. Clique em "Nova Categoria" para começar.
                                        </td>
                                    </tr>
                                ` : categorias.map(cat => `
                                    <tr>
                                        <td><strong>${cat.nome}</strong></td>
                                        <td>${cat.descricao || '-'}</td>
                                        <td>
                                            <span class="status-badge ${cat.ativo ? 'status-aprovado' : 'status-rejeitado'}">
                                                ${cat.ativo ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </td>
                                        <td>${Utils.formatarData(cat.created_at)}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="Categorias.editar(${cat.id})" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="Categorias.confirmarExclusao(${cat.id}, '${cat.nome}')" title="Excluir">
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
                <div id="modalCategoria" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="modalTitulo">Nova Categoria</h2>
                            <span class="modal-close" onclick="Categorias.fecharModal()">&times;</span>
                        </div>
                        <form id="formCategoria" onsubmit="Categorias.salvar(event)">
                            <input type="hidden" id="catId" value="">
                            
                            <div class="form-group">
                                <label for="catNome">Nome *</label>
                                <input type="text" id="catNome" required placeholder="Ex: Salários, Marketing, Infraestrutura">
                            </div>
                            
                            <div class="form-group">
                                <label for="catDescricao">Descrição</label>
                                <textarea id="catDescricao" rows="3" placeholder="Descrição da categoria..."></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="catAtiva" checked>
                                    Ativa
                                </label>
                            </div>
                            
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" onclick="Categorias.fecharModal()">Cancelar</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<div class="alert alert-error">Erro ao carregar categorias: ${error.message}</div>`;
        }
    };
    
    const showNovoModal = () => {
        document.getElementById('modalTitulo').textContent = 'Nova Categoria';
        document.getElementById('catId').value = '';
        document.getElementById('catNome').value = '';
        document.getElementById('catDescricao').value = '';
        document.getElementById('catAtiva').checked = true;
        document.getElementById('modalCategoria').style.display = 'flex';
    };
    
    const editar = async (id) => {
        try {
            const cat = categorias.find(c => c.id === id);
            if (!cat) {
                Utils.mostrarAlerta('Categoria não encontrada', 'error');
                return;
            }
            
            document.getElementById('modalTitulo').textContent = 'Editar Categoria';
            document.getElementById('catId').value = cat.id;
            document.getElementById('catNome').value = cat.nome;
            document.getElementById('catDescricao').value = cat.descricao || '';
            document.getElementById('catAtiva').checked = cat.ativo;
            document.getElementById('modalCategoria').style.display = 'flex';
        } catch (error) {
            Utils.mostrarAlerta('Erro ao carregar categoria: ' + error.message, 'error');
        }
    };
    
    const salvar = async (event) => {
        event.preventDefault();
        
        const id = document.getElementById('catId').value;
        const dados = {
            nome: document.getElementById('catNome').value.trim(),
            descricao: document.getElementById('catDescricao').value.trim(),
            ativo: document.getElementById('catAtiva').checked ? 1 : 0
        };
        
        if (!dados.nome) {
            Utils.mostrarAlerta('Nome é obrigatório', 'warning');
            return;
        }
        
        try {
            if (id) {
                await API.categorias.atualizar(id, dados);
                Utils.mostrarAlerta('Categoria atualizada com sucesso!', 'success');
            } else {
                await API.categorias.criar(dados);
                Utils.mostrarAlerta('Categoria criada com sucesso!', 'success');
            }
            
            fecharModal();
            render(document.getElementById('pageContent'));
        } catch (error) {
            Utils.mostrarAlerta('Erro ao salvar: ' + error.message, 'error');
        }
    };
    
    const confirmarExclusao = (id, nome) => {
        if (confirm(`Deseja realmente excluir a categoria "${nome}"?\n\nEsta ação não pode ser desfeita.`)) {
            deletar(id);
        }
    };
    
    const deletar = async (id) => {
        try {
            await API.categorias.deletar(id);
            Utils.mostrarAlerta('Categoria excluída com sucesso!', 'success');
            render(document.getElementById('pageContent'));
        } catch (error) {
            Utils.mostrarAlerta('Erro ao excluir: ' + error.message, 'error');
        }
    };
    
    const fecharModal = () => {
        document.getElementById('modalCategoria').style.display = 'none';
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
