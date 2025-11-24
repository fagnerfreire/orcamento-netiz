// Módulo Usuários - Completo
const Usuarios = (() => {
    let usuarios = [];
    let departamentos = [];
    
    const render = async (container) => {
        Utils.showLoading('pageContent');
        
        try {
            usuarios = await API.usuarios.listar();
            departamentos = await API.departamentos.listar();
            
            container.innerHTML = `
                <div class="card-header">
                    <h1>Usuários do Sistema</h1>
                    <button class="btn btn-primary" onclick="Usuarios.showNovoModal()">
                        <i class="fas fa-plus"></i> Novo Usuário
                    </button>
                </div>
                
                <div class="card">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Perfil</th>
                                    <th>Status</th>
                                    <th>Criado em</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${usuarios.length === 0 ? `
                                    <tr>
                                        <td colspan="6" style="text-align: center; padding: 2rem;">
                                            Nenhum usuário cadastrado.
                                        </td>
                                    </tr>
                                ` : usuarios.map(user => `
                                    <tr>
                                        <td><strong>${user.nome}</strong></td>
                                        <td>${user.email}</td>
                                        <td><span class="badge badge-${getPerfil ColorClass(user.perfil)}">${user.perfil.toUpperCase()}</span></td>
                                        <td>
                                            <span class="status-badge ${user.ativo ? 'status-aprovado' : 'status-rejeitado'}">
                                                ${user.ativo ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td>${Utils.formatarData(user.created_at)}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="Usuarios.editar(${user.id})" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            ${Auth.getUser().id !== user.id ? `
                                                <button class="btn btn-sm btn-danger" onclick="Usuarios.confirmarExclusao(${user.id}, '${user.nome}')" title="Excluir">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            ` : ''}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Modal Novo/Editar -->
                <div id="modalUsuario" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="modalTitulo">Novo Usuário</h2>
                            <span class="modal-close" onclick="Usuarios.fecharModal()">&times;</span>
                        </div>
                        <form id="formUsuario" onsubmit="Usuarios.salvar(event)">
                            <input type="hidden" id="userId" value="">
                            
                            <div class="form-group">
                                <label for="userNome">Nome Completo *</label>
                                <input type="text" id="userNome" required placeholder="Ex: João Silva">
                            </div>
                            
                            <div class="form-group">
                                <label for="userEmail">Email *</label>
                                <input type="email" id="userEmail" required placeholder="usuario@netiz.com.br">
                            </div>
                            
                            <div class="form-group" id="senhaGroup">
                                <label for="userSenha">Senha *</label>
                                <input type="password" id="userSenha" placeholder="Mínimo 6 caracteres">
                                <small id="senhaHint">Deixe em branco para manter a senha atual</small>
                            </div>
                            
                            <div class="form-group">
                                <label for="userPerfil">Perfil *</label>
                                <select id="userPerfil" required>
                                    <option value="">Selecione...</option>
                                    <option value="admin">Admin - Acesso Total</option>
                                    <option value="financeiro">Financeiro - Lançamento de Valores</option>
                                    <option value="gestor">Gestor - Gestão de Orçamentos</option>
                                    <option value="leitura">Leitura - Apenas Visualização</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="userAtivo" checked>
                                    Ativo
                                </label>
                            </div>
                            
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" onclick="Usuarios.fecharModal()">Cancelar</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<div class="alert alert-error">Erro ao carregar usuários: ${error.message}</div>`;
        }
    };
    
    const getPerfilColorClass = (perfil) => {
        const colors = {
            'admin': 'primary',
            'financeiro': 'success',
            'gestor': 'warning',
            'leitura': 'secondary'
        };
        return colors[perfil] || 'secondary';
    };
    
    const showNovoModal = () => {
        document.getElementById('modalTitulo').textContent = 'Novo Usuário';
        document.getElementById('userId').value = '';
        document.getElementById('userNome').value = '';
        document.getElementById('userEmail').value = '';
        document.getElementById('userSenha').value = '';
        document.getElementById('userSenha').required = true;
        document.getElementById('senhaHint').style.display = 'none';
        document.getElementById('userPerfil').value = '';
        document.getElementById('userAtivo').checked = true;
        document.getElementById('modalUsuario').style.display = 'flex';
    };
    
    const editar = async (id) => {
        try {
            const user = usuarios.find(u => u.id === id);
            if (!user) {
                Utils.mostrarAlerta('Usuário não encontrado', 'error');
                return;
            }
            
            document.getElementById('modalTitulo').textContent = 'Editar Usuário';
            document.getElementById('userId').value = user.id;
            document.getElementById('userNome').value = user.nome;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userSenha').value = '';
            document.getElementById('userSenha').required = false;
            document.getElementById('senhaHint').style.display = 'block';
            document.getElementById('userPerfil').value = user.perfil;
            document.getElementById('userAtivo').checked = user.ativo;
            document.getElementById('modalUsuario').style.display = 'flex';
        } catch (error) {
            Utils.mostrarAlerta('Erro ao carregar usuário: ' + error.message, 'error');
        }
    };
    
    const salvar = async (event) => {
        event.preventDefault();
        
        const id = document.getElementById('userId').value;
        const senha = document.getElementById('userSenha').value;
        
        const dados = {
            nome: document.getElementById('userNome').value.trim(),
            email: document.getElementById('userEmail').value.trim(),
            perfil: document.getElementById('userPerfil').value,
            ativo: document.getElementById('userAtivo').checked ? 1 : 0
        };
        
        // Adicionar senha apenas se foi preenchida
        if (senha) {
            if (senha.length < 6) {
                Utils.mostrarAlerta('Senha deve ter no mínimo 6 caracteres', 'warning');
                return;
            }
            dados.senha = senha;
        } else if (!id) {
            Utils.mostrarAlerta('Senha é obrigatória para novos usuários', 'warning');
            return;
        }
        
        if (!dados.nome || !dados.email || !dados.perfil) {
            Utils.mostrarAlerta('Preencha todos os campos obrigatórios', 'warning');
            return;
        }
        
        try {
            if (id) {
                await API.usuarios.atualizar(id, dados);
                Utils.mostrarAlerta('Usuário atualizado com sucesso!', 'success');
            } else {
                await API.usuarios.criar(dados);
                Utils.mostrarAlerta('Usuário criado com sucesso!', 'success');
            }
            
            fecharModal();
            render(document.getElementById('pageContent'));
        } catch (error) {
            Utils.mostrarAlerta('Erro ao salvar: ' + error.message, 'error');
        }
    };
    
    const confirmarExclusao = (id, nome) => {
        if (confirm(`Deseja realmente excluir o usuário "${nome}"?\n\nEsta ação não pode ser desfeita.`)) {
            deletar(id);
        }
    };
    
    const deletar = async (id) => {
        try {
            await API.usuarios.deletar(id);
            Utils.mostrarAlerta('Usuário excluído com sucesso!', 'success');
            render(document.getElementById('pageContent'));
        } catch (error) {
            Utils.mostrarAlerta('Erro ao excluir: ' + error.message, 'error');
        }
    };
    
    const fecharModal = () => {
        document.getElementById('modalUsuario').style.display = 'none';
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
