// Módulo Períodos - Completo
const Periodos = (() => {
    let periodos = [];
    
    const render = async (container) => {
        Utils.showLoading('pageContent');
        
        try {
            periodos = await API.periodos.listar();
            
            container.innerHTML = `
                <div class="card-header">
                    <h1>Períodos Orçamentários</h1>
                    <button class="btn btn-primary" onclick="Periodos.showNovoModal()">
                        <i class="fas fa-plus"></i> Novo Período
                    </button>
                </div>
                
                <div class="card">
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Ano</th>
                                    <th>Tipo</th>
                                    <th>Status</th>
                                    <th>Data Abertura</th>
                                    <th>Data Fechamento</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${periodos.length === 0 ? `
                                    <tr>
                                        <td colspan="6" style="text-align: center; padding: 2rem;">
                                            Nenhum período cadastrado. Clique em "Novo Período" para começar.
                                        </td>
                                    </tr>
                                ` : periodos.map(per => `
                                    <tr>
                                        <td><strong>${per.ano}</strong></td>
                                        <td>${formatarTipo(per.tipo)}</td>
                                        <td>
                                            <span class="status-badge ${per.status === 'aberto' ? 'status-aprovado' : 'status-pendente'}">
                                                ${per.status === 'aberto' ? 'Aberto' : 'Fechado'}
                                            </span>
                                        </td>
                                        <td>${per.data_abertura ? Utils.formatarData(per.data_abertura) : '-'}</td>
                                        <td>${per.data_fechamento ? Utils.formatarData(per.data_fechamento) : '-'}</td>
                                        <td>
                                            ${per.status === 'fechado' ? `
                                                <button class="btn btn-sm btn-success" onclick="Periodos.alterarStatus(${per.id}, 'aberto')" title="Abrir Período">
                                                    <i class="fas fa-lock-open"></i>
                                                </button>
                                            ` : `
                                                <button class="btn btn-sm btn-warning" onclick="Periodos.alterarStatus(${per.id}, 'fechado')" title="Fechar Período">
                                                    <i class="fas fa-lock"></i>
                                                </button>
                                            `}
                                            <button class="btn btn-sm btn-primary" onclick="Periodos.editar(${per.id})" title="Editar">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-danger" onclick="Periodos.confirmarExclusao(${per.id}, '${per.ano} - ${formatarTipo(per.tipo)}')" title="Excluir">
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
                <div id="modalPeriodo" class="modal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 id="modalTitulo">Novo Período</h2>
                            <span class="modal-close" onclick="Periodos.fecharModal()">&times;</span>
                        </div>
                        <form id="formPeriodo" onsubmit="Periodos.salvar(event)">
                            <input type="hidden" id="perId" value="">
                            
                            <div class="form-group">
                                <label for="perAno">Ano *</label>
                                <input type="number" id="perAno" required min="2020" max="2050" value="${new Date().getFullYear()}">
                            </div>
                            
                            <div class="form-group">
                                <label for="perTipo">Tipo *</label>
                                <select id="perTipo" required>
                                    <option value="">Selecione...</option>
                                    <option value="anual">Anual</option>
                                    <option value="trimestre_1">1º Trimestre (Jan-Mar)</option>
                                    <option value="trimestre_2">2º Trimestre (Abr-Jun)</option>
                                    <option value="trimestre_3">3º Trimestre (Jul-Set)</option>
                                    <option value="trimestre_4">4º Trimestre (Out-Dez)</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="perStatus">Status *</label>
                                <select id="perStatus" required>
                                    <option value="fechado">Fechado</option>
                                    <option value="aberto">Aberto</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="perDataAbertura">Data de Abertura</label>
                                <input type="date" id="perDataAbertura">
                            </div>
                            
                            <div class="form-group">
                                <label for="perDataFechamento">Data de Fechamento</label>
                                <input type="date" id="perDataFechamento">
                            </div>
                            
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" onclick="Periodos.fecharModal()">Cancelar</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save"></i> Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<div class="alert alert-error">Erro ao carregar períodos: ${error.message}</div>`;
        }
    };
    
    const formatarTipo = (tipo) => {
        const tipos = {
            'anual': 'Anual',
            'trimestre_1': '1º Trimestre',
            'trimestre_2': '2º Trimestre',
            'trimestre_3': '3º Trimestre',
            'trimestre_4': '4º Trimestre'
        };
        return tipos[tipo] || tipo;
    };
    
    const showNovoModal = () => {
        document.getElementById('modalTitulo').textContent = 'Novo Período';
        document.getElementById('perId').value = '';
        document.getElementById('perAno').value = new Date().getFullYear();
        document.getElementById('perTipo').value = '';
        document.getElementById('perStatus').value = 'fechado';
        document.getElementById('perDataAbertura').value = '';
        document.getElementById('perDataFechamento').value = '';
        document.getElementById('modalPeriodo').style.display = 'flex';
    };
    
    const editar = async (id) => {
        try {
            const per = periodos.find(p => p.id === id);
            if (!per) {
                Utils.mostrarAlerta('Período não encontrado', 'error');
                return;
            }
            
            document.getElementById('modalTitulo').textContent = 'Editar Período';
            document.getElementById('perId').value = per.id;
            document.getElementById('perAno').value = per.ano;
            document.getElementById('perTipo').value = per.tipo;
            document.getElementById('perStatus').value = per.status;
            document.getElementById('perDataAbertura').value = per.data_abertura ? per.data_abertura.split('T')[0] : '';
            document.getElementById('perDataFechamento').value = per.data_fechamento ? per.data_fechamento.split('T')[0] : '';
            document.getElementById('modalPeriodo').style.display = 'flex';
        } catch (error) {
            Utils.mostrarAlerta('Erro ao carregar período: ' + error.message, 'error');
        }
    };
    
    const salvar = async (event) => {
        event.preventDefault();
        
        const id = document.getElementById('perId').value;
        const dados = {
            ano: parseInt(document.getElementById('perAno').value),
            tipo: document.getElementById('perTipo').value,
            status: document.getElementById('perStatus').value,
            data_abertura: document.getElementById('perDataAbertura').value || null,
            data_fechamento: document.getElementById('perDataFechamento').value || null
        };
        
        if (!dados.ano || !dados.tipo || !dados.status) {
            Utils.mostrarAlerta('Preencha todos os campos obrigatórios', 'warning');
            return;
        }
        
        try {
            if (id) {
                await API.periodos.atualizar(id, dados);
                Utils.mostrarAlerta('Período atualizado com sucesso!', 'success');
            } else {
                await API.periodos.criar(dados);
                Utils.mostrarAlerta('Período criado com sucesso!', 'success');
            }
            
            fecharModal();
            render(document.getElementById('pageContent'));
        } catch (error) {
            Utils.mostrarAlerta('Erro ao salvar: ' + error.message, 'error');
        }
    };
    
    const alterarStatus = async (id, novoStatus) => {
        try {
            await API.periodos.atualizar(id, { status: novoStatus });
            Utils.mostrarAlerta(`Período ${novoStatus === 'aberto' ? 'aberto' : 'fechado'} com sucesso!`, 'success');
            render(document.getElementById('pageContent'));
        } catch (error) {
            Utils.mostrarAlerta('Erro ao alterar status: ' + error.message, 'error');
        }
    };
    
    const confirmarExclusao = (id, nome) => {
        if (confirm(`Deseja realmente excluir o período "${nome}"?\n\nEsta ação não pode ser desfeita e pode afetar orçamentos vinculados.`)) {
            deletar(id);
        }
    };
    
    const deletar = async (id) => {
        try {
            await API.periodos.deletar(id);
            Utils.mostrarAlerta('Período excluído com sucesso!', 'success');
            render(document.getElementById('pageContent'));
        } catch (error) {
            Utils.mostrarAlerta('Erro ao excluir: ' + error.message, 'error');
        }
    };
    
    const fecharModal = () => {
        document.getElementById('modalPeriodo').style.display = 'none';
    };
    
    return { 
        render, 
        showNovoModal, 
        editar, 
        salvar,
        alterarStatus,
        confirmarExclusao,
        deletar,
        fecharModal
    };
})();
