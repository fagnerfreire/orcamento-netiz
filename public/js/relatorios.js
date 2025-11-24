// Módulo Relatórios
const Relatorios = (() => {
    const render = async (container) => {
        Utils.showLoading('pageContent');
        
        try {
            const anoAtual = new Date().getFullYear();
            
            container.innerHTML = `
                <div class="card-header">
                    <h1><i class="fas fa-file-pdf"></i> Relatórios</h1>
                </div>
                
                <div class="card">
                    <h3>Relatórios Disponíveis</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
                        
                        <div class="stat-card" style="cursor: pointer;" onclick="Relatorios.exportarConsolidado()">
                            <div class="stat-icon primary">
                                <i class="fas fa-file-download"></i>
                            </div>
                            <div class="stat-info">
                                <h4>Relatório Consolidado</h4>
                                <p>Visão geral de todos os departamentos</p>
                                <button class="btn btn-sm btn-primary mt-1">
                                    <i class="fas fa-download"></i> Exportar PDF
                                </button>
                            </div>
                        </div>
                        
                        <div class="stat-card" style="cursor: pointer;" onclick="Relatorios.exportarVariacao()">
                            <div class="stat-icon warning">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="stat-info">
                                <h4>Análise de Variação</h4>
                                <p>Orçado vs Realizado detalhado</p>
                                <button class="btn btn-sm btn-primary mt-1">
                                    <i class="fas fa-download"></i> Exportar PDF
                                </button>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon success">
                                <i class="fas fa-building"></i>
                            </div>
                            <div class="stat-info">
                                <h4>Por Departamento</h4>
                                <p>Selecione um departamento específico</p>
                                <select id="selectDepartamento" class="form-control mt-1" style="width: 100%;">
                                    <option value="">Carregando...</option>
                                </select>
                                <button class="btn btn-sm btn-primary mt-1" onclick="Relatorios.exportarDepartamento()">
                                    <i class="fas fa-download"></i> Exportar PDF
                                </button>
                            </div>
                        </div>
                        
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Visualização Rápida</h3>
                        <button class="btn btn-secondary" onclick="Relatorios.carregarPreview()">
                            <i class="fas fa-sync"></i> Atualizar
                        </button>
                    </div>
                    <div id="previewRelatorio">
                        <p class="text-center" style="padding: 2rem;">Clique em "Atualizar" para visualizar</p>
                    </div>
                </div>
            `;
            
            // Carregar departamentos
            carregarDepartamentos();
            
        } catch (error) {
            container.innerHTML = `<div class="alert alert-error">Erro: ${error.message}</div>`;
        }
    };
    
    const carregarDepartamentos = async () => {
        try {
            const departamentos = await API.departamentos.listar(1);
            const select = document.getElementById('selectDepartamento');
            if (select) {
                select.innerHTML = '<option value="">Selecione...</option>' +
                    departamentos.map(d => `<option value="${d.id}">${d.nome}</option>`).join('');
            }
        } catch (error) {
            console.error('Erro ao carregar departamentos:', error);
        }
    };
    
    const exportarConsolidado = async () => {
        try {
            Utils.mostrarAlerta('Gerando relatório...', 'warning');
            const anoAtual = new Date().getFullYear();
            const data = await API.relatorios.consolidado(anoAtual);
            gerarPDFConsolidado(data);
            Utils.mostrarAlerta('Relatório gerado com sucesso!', 'success');
        } catch (error) {
            Utils.mostrarAlerta('Erro ao gerar relatório: ' + error.message, 'error');
        }
    };
    
    const exportarDepartamento = async () => {
        const select = document.getElementById('selectDepartamento');
        const depId = select?.value;
        
        if (!depId) {
            Utils.mostrarAlerta('Selecione um departamento', 'warning');
            return;
        }
        
        try {
            Utils.mostrarAlerta('Gerando relatório...', 'warning');
            const anoAtual = new Date().getFullYear();
            const data = await API.relatorios.departamento(depId, anoAtual);
            gerarPDFDepartamento(data);
            Utils.mostrarAlerta('Relatório gerado com sucesso!', 'success');
        } catch (error) {
            Utils.mostrarAlerta('Erro ao gerar relatório: ' + error.message, 'error');
        }
    };
    
    const exportarVariacao = async () => {
        try {
            Utils.mostrarAlerta('Gerando relatório...', 'warning');
            const anoAtual = new Date().getFullYear();
            const data = await API.relatorios.variacao(anoAtual);
            gerarPDFVariacao(data);
            Utils.mostrarAlerta('Relatório gerado com sucesso!', 'success');
        } catch (error) {
            Utils.mostrarAlerta('Erro ao gerar relatório: ' + error.message, 'error');
        }
    };
    
    const carregarPreview = async () => {
        const preview = document.getElementById('previewRelatorio');
        if (!preview) return;
        
        preview.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Carregando...</p></div>';
        
        try {
            const anoAtual = new Date().getFullYear();
            const data = await API.relatorios.consolidado(anoAtual);
            
            preview.innerHTML = `
                <div style="padding: 1rem;">
                    <h3>Resumo Consolidado ${data.ano}</h3>
                    <div class="stats-grid" style="margin: 1.5rem 0;">
                        <div class="stat-card">
                            <div class="stat-info">
                                <p>Total Orçado</p>
                                <h3>${Utils.formatarMoeda(data.totais?.total_orcado || 0)}</h3>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <p>Total Realizado</p>
                                <h3>${Utils.formatarMoeda(data.totais?.total_realizado || 0)}</h3>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <p>% Execução</p>
                                <h3>${data.totais?.percentual_execucao || 0}%</h3>
                            </div>
                        </div>
                    </div>
                    
                    <h4>Por Departamento:</h4>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Departamento</th>
                                    <th>Orçado</th>
                                    <th>Realizado</th>
                                    <th>%</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.porDepartamento?.map(d => `
                                    <tr>
                                        <td>${d.nome}</td>
                                        <td>${Utils.formatarMoeda(d.total_orcado)}</td>
                                        <td>${Utils.formatarMoeda(d.total_realizado)}</td>
                                        <td>${d.percentual || 0}%</td>
                                    </tr>
                                `).join('') || ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            preview.innerHTML = `<div class="alert alert-error">Erro ao carregar: ${error.message}</div>`;
        }
    };
    
    // Funções de geração de PDF (simplificadas - podem ser expandidas)
    const gerarPDFConsolidado = (data) => {
        // Implementação básica - pode ser expandida com jsPDF
        const conteudo = JSON.stringify(data, null, 2);
        const blob = new Blob([conteudo], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_consolidado_${data.ano}.json`;
        a.click();
    };
    
    const gerarPDFDepartamento = (data) => {
        const conteudo = JSON.stringify(data, null, 2);
        const blob = new Blob([conteudo], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_${data.departamento?.nome}_${data.ano}.json`;
        a.click();
    };
    
    const gerarPDFVariacao = (data) => {
        const conteudo = JSON.stringify(data, null, 2);
        const blob = new Blob([conteudo], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_variacao_${data.ano}.json`;
        a.click();
    };
    
    return { 
        render, 
        exportarConsolidado, 
        exportarDepartamento, 
        exportarVariacao,
        carregarPreview
    };
})();
