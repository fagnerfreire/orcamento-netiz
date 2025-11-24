// Módulo Categorias - Completo com Upload
const Categorias = (() => {
    let categorias = [];
    
    const render = async (container) => {
        Utils.showLoading('pageContent');
        
        try {
            categorias = await API.categorias.listar();
            
            container.innerHTML = `
                <div class="card-header">
                    <h1>Categorias de Orçamento</h1>
                    <div>
                        <button class="btn btn-success" onclick="Categorias.showUploadModal()" style="margin-right: 10px;">
                            <i class="fas fa-file-upload"></i> Importar Categorias
                        </button>
                        <button class="btn btn-primary" onclick="Categorias.showNovoModal()">
                            <i class="fas fa-plus"></i> Nova Categoria
                        </button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Status</th>
                                    <th>Criado em</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${categorias.length === 0 ? `
                                    <tr>
                                        <td colspan="4" style="text-align: center; padding: 2rem;">
                                            Nenhuma categoria cadastrada. Clique em "Nova Categoria" ou "Importar Categorias".
                                        </td>
                                    </tr>
                                ` : categorias.map(cat => `
                                    <tr>
                                        <td><strong>${cat.nome}</strong></td>
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
                
                <!-- Modal Upload -->
                <div id="modalUpload" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>Importar Categorias</h2>
                            <span class="modal-close" onclick="Categorias.fecharModalUpload()">&times;</span>
                        </div>
                        <div style="padding: 20px;">
                            <div class="alert alert-info" style="margin-bottom: 20px;">
                                <strong>📋 Formato do Arquivo:</strong><br>
                                • <strong>Excel (.xlsx)</strong> ou <strong>CSV (.csv)</strong><br>
                                • Coluna: <strong>nome</strong> (obrigatório)<br>
                                • Exemplo: <a href="#" onclick="Categorias.baixarModelo(); return false;">Baixar modelo</a>
                            </div>
                            
                            <form id="formUpload" onsubmit="Categorias.processarUpload(event)">
                                <div class="form-group">
                                    <label for="arquivoUpload">Selecione o arquivo *</label>
                                    <input type="file" id="arquivoUpload" accept=".xlsx,.xls,.csv" required>
                                </div>
                                
                                <div id="uploadStatus" style="margin-top: 15px;"></div>
                                
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" onclick="Categorias.fecharModalUpload()">Cancelar</button>
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-upload"></i> Importar
                                    </button>
                                </div>
                            </form>
                        </div>
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
        document.getElementById('catAtiva').checked = true;
        document.getElementById('modalCategoria').style.display = 'flex';
    };
    
    const showUploadModal = () => {
        document.getElementById('formUpload').reset();
        document.getElementById('uploadStatus').innerHTML = '';
        document.getElementById('modalUpload').style.display = 'flex';
    };
    
    const baixarModelo = () => {
        // Criar CSV modelo
        const csv = 'nome\nSalários\nMarketing\nInfraestrutura\nTreinamento\nViagens';
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'modelo_categorias.csv';
        link.click();
        Utils.mostrarAlerta('Modelo baixado com sucesso!', 'success');
    };
    
    const processarUpload = async (event) => {
        event.preventDefault();
        
        const arquivo = document.getElementById('arquivoUpload').files[0];
        if (!arquivo) {
            Utils.mostrarAlerta('Selecione um arquivo', 'warning');
            return;
        }
        
        const statusDiv = document.getElementById('uploadStatus');
        statusDiv.innerHTML = '<div class="alert alert-info">Processando arquivo...</div>';
        
        try {
            const response = await API.categorias.importar(arquivo);
            
            statusDiv.innerHTML = `
                <div class="alert alert-success">
                    <strong>✅ Importação concluída!</strong><br>
                    • ${response.importadas || 0} categorias importadas<br>
                    ${response.duplicadas > 0 ? `• ${response.duplicadas} duplicadas ignoradas<br>` : ''}
                    ${response.erros > 0 ? `• ${response.erros} erros<br>` : ''}
                </div>
            `;
            
            setTimeout(() => {
                fecharModalUpload();
                render(document.getElementById('pageContent'));
            }, 2000);
            
        } catch (error) {
            statusDiv.innerHTML = `<div class="alert alert-error">Erro ao importar: ${error.message}</div>`;
        }
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
    
    const fecharModalUpload = () => {
        document.getElementById('modalUpload').style.display = 'none';
    };
    
    return { 
        render, 
        showNovoModal,
        showUploadModal,
        baixarModelo,
        processarUpload,
        editar, 
        salvar,
        confirmarExclusao,
        deletar,
        fecharModal,
        fecharModalUpload
    };
})();
