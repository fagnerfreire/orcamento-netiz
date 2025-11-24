// Módulo Departamentos - Completo com Hierarquia
const Departamentos = (() => {
    let departamentos = [];
    
    const render = async (container) => {
        Utils.showLoading('pageContent');
        
        try {
            departamentos = await API.departamentos.listar();
            
            // Organizar em estrutura de árvore
            const arvore = construirArvore(departamentos);
            
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
                                    <th>Estrutura</th>
                                    <th>Tipo</th>
                                    <th>Descrição</th>
                                    <th>Situação</th>
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
                                ` : renderArvore(arvore, 0)}
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
                                <label for="depPai">Departamento Pai (Hierarquia)</label>
                                <select id="depPai">
                                    <option value="">Nenhum (Departamento Raiz)</option>
                                </select>
                                <small>Selecione um departamento superior para criar uma hierarquia</small>
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
                                <label for="depSituacao">Situação *</label>
                                <select id="depSituacao" required>
                                    <option value="1">Ativo</option>
                                    <option value="0">Desativado</option>
                                </select>
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
    
    const construirArvore = (lista) => {
        const mapa = {};
        const raizes = [];
        
        // Criar mapa de departamentos
        lista.forEach(dep => {
            mapa[dep.id] = { ...dep, filhos: [] };
        });
        
        // Construir árvore
        lista.forEach(dep => {
            if (dep.departamento_pai_id) {
                if (mapa[dep.departamento_pai_id]) {
                    mapa[dep.departamento_pai_id].filhos.push(mapa[dep.id]);
                } else {
                    raizes.push(mapa[dep.id]);
                }
            } else {
                raizes.push(mapa[dep.id]);
            }
        });
        
        return raizes;
    };
    
    const renderArvore = (nos, nivel) => {
        let html = '';
        nos.forEach(no => {
            const indentacao = '&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(nivel);
            const icone = no.filhos.length > 0 ? '<i class="fas fa-folder"></i>' : '<i class="fas fa-folder-open"></i>';
            
            html += `
                <tr>
                    <td>
                        ${indentacao}${icone} <strong>${no.nome}</strong>
                    </td>
                    <td>${no.tipo || '-'}</td>
                    <td>${no.descricao || '-'}</td>
                    <td>
                        <span class="status-badge ${no.ativo ? 'status-aprovado' : 'status-rejeitado'}">
                            ${no.ativo ? 'Ativo' : 'Desativado'}
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="Departamentos.editar(${no.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="Departamentos.confirmarExclusao(${no.id}, '${no.nome}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
            
            if (no.filhos.length > 0) {
                html += renderArvore(no.filhos, nivel + 1);
            }
        });
        return html;
    };
    
    const carregarOpcoesPai = (idAtual = null) => {
        const select = document.getElementById('depPai');
        select.innerHTML = '<option value="">Nenhum (Departamento Raiz)</option>';
        
        // Filtrar departamentos ativos, exceto o atual
        const disponiveis = departamentos.filter(d => d.ativo && d.id !== idAtual);
        
        disponiveis.forEach(dep => {
            const option = document.createElement('option');
            option.value = dep.id;
            option.textContent = dep.nome;
            select.appendChild(option);
        });
    };
    
    const showNovoModal = () => {
        document.getElementById('modalTitulo').textContent = 'Novo Departamento';
        document.getElementById('depId').value = '';
        document.getElementById('depNome').value = '';
        carregarOpcoesPai();
        document.getElementById('depPai').value = '';
        document.getElementById('depTipo').value = '';
        document.getElementById('depDescricao').value = '';
        document.getElementById('depSituacao').value = '1';
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
            carregarOpcoesPai(dep.id);
            document.getElementById('depPai').value = dep.departamento_pai_id || '';
            document.getElementById('depTipo').value = dep.tipo || '';
            document.getElementById('depDescricao').value = dep.descricao || '';
            document.getElementById('depSituacao').value = dep.ativo ? '1' : '0';
            document.getElementById('modalDepartamento').style.display = 'flex';
        } catch (error) {
            Utils.mostrarAlerta('Erro ao carregar departamento: ' + error.message, 'error');
        }
    };
    
    const salvar = async (event) => {
        event.preventDefault();
        
        const id = document.getElementById('depId').value;
        const depPaiId = document.getElementById('depPai').value;
        
        const dados = {
            nome: document.getElementById('depNome').value.trim(),
            departamento_pai_id: depPaiId ? parseInt(depPaiId) : null,
            tipo: document.getElementById('depTipo').value,
            descricao: document.getElementById('depDescricao').value.trim(),
            ativo: parseInt(document.getElementById('depSituacao').value)
        };
        
        if (!dados.nome) {
            Utils.mostrarAlerta('Nome é obrigatório', 'warning');
            return;
        }
        
        // Validar ciclo circular
        if (id && depPaiId && id === depPaiId) {
            Utils.mostrarAlerta('Um departamento não pode ser pai de si mesmo', 'warning');
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
        const dep = departamentos.find(d => d.id === id);
        const temFilhos = departamentos.some(d => d.departamento_pai_id === id);
        
        let mensagem = `Deseja realmente excluir o departamento "${nome}"?`;
        if (temFilhos) {
            mensagem += '\n\n⚠️ ATENÇÃO: Este departamento possui subdepartamentos vinculados!';
        }
        mensagem += '\n\nEsta ação não pode ser desfeita.';
        
        if (confirm(mensagem)) {
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
