// Módulo Dashboard
const Dashboard = (() => {
    const render = async (container) => {
        Utils.showLoading('pageContent');
        DashboardCharts.destroyCharts();
        
        try {
            const anoAtual = new Date().getFullYear();
            const data = await API.dashboard.geral(anoAtual);
            
            container.innerHTML = `
                <div class="page-header">
                    <h1>Dashboard - ${data.ano}</h1>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon primary">
                            <i class="fas fa-file-invoice-dollar"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${data.totais_orcamentos?.total_orcamentos || 0}</h3>
                            <p>Total de Orçamentos</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon warning">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${data.totais_orcamentos?.aguardando_aprovacao || 0}</h3>
                            <p>Aguardando Aprovação</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon success">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${data.totais_orcamentos?.aprovados || 0}</h3>
                            <p>Aprovados</p>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon danger">
                            <i class="fas fa-times-circle"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${data.totais_orcamentos?.rejeitados || 0}</h3>
                            <p>Rejeitados</p>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Resumo Consolidado ${data.ano}</h2>
                    </div>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-info">
                                <p>Total Orçado</p>
                                <h3>${Utils.formatarMoeda(data.totais_consolidados?.total_orcado_ano || 0)}</h3>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <p>Total Realizado</p>
                                <h3>${Utils.formatarMoeda(data.totais_consolidados?.total_realizado_ano || 0)}</h3>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-info">
                                <p>% Execução</p>
                                <h3>${data.totais_consolidados?.percentual_execucao_ano || 0}%</h3>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Por Departamento</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Departamento</th>
                                    <th>Orçado</th>
                                    <th>Realizado</th>
                                    <th>% Execução</th>
                                    <th>Diferença</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.por_departamento?.map(dep => `
                                    <tr>
                                        <td><strong>${dep.nome}</strong></td>
                                        <td>${Utils.formatarMoeda(dep.total_orcado)}</td>
                                        <td>${Utils.formatarMoeda(dep.total_realizado)}</td>
                                        <td>${dep.percentual_execucao || 0}%</td>
                                        <td style="color: ${(dep.total_realizado - dep.total_orcado) > 0 ? 'var(--danger-color)' : 'var(--secondary-color)'}">
                                            ${Utils.formatarMoeda(dep.total_realizado - dep.total_orcado)}
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="5" class="text-center">Nenhum dado disponível</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Evolução Mensal</h2>
                    </div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Mês</th>
                                    <th>Orçado</th>
                                    <th>Realizado</th>
                                    <th>Diferença</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.por_mes?.map(mes => `
                                    <tr>
                                        <td><strong>${Utils.getNomeMes(mes.mes)}</strong></td>
                                        <td>${Utils.formatarMoeda(mes.orcado)}</td>
                                        <td>${Utils.formatarMoeda(mes.realizado)}</td>
                                        <td style="color: ${(mes.realizado - mes.orcado) > 0 ? 'var(--danger-color)' : 'var(--secondary-color)'}">
                                            ${Utils.formatarMoeda(mes.realizado - mes.orcado)}
                                        </td>
                                    </tr>
                                `).join('') || '<tr><td colspan="4" class="text-center">Nenhum dado disponível</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h2 class="card-title">Gráficos e Análises</h2>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; padding: 1rem;">
                        <div style="height: 300px;">
                            <canvas id="graficoMensal"></canvas>
                        </div>
                        <div style="height: 300px;">
                            <canvas id="graficoCategorias"></canvas>
                        </div>
                        <div style="height: 300px;">
                            <canvas id="graficoDepartamentos"></canvas>
                        </div>
                        <div style="height: 300px;">
                            <canvas id="graficoTrimestral"></canvas>
                        </div>
                    </div>
                </div>
            `;
            
            // Criar gráficos após renderizar o HTML
            setTimeout(() => {
                if (data.por_mes && data.por_mes.length > 0) {
                    DashboardCharts.criarGraficoMensal('graficoMensal', data.por_mes);
                }
                if (data.top_categorias && data.top_categorias.length > 0) {
                    DashboardCharts.criarGraficoCategorias('graficoCategorias', data.top_categorias);
                }
                if (data.por_departamento && data.por_departamento.length > 0) {
                    DashboardCharts.criarGraficoDepartamentos('graficoDepartamentos', data.por_departamento);
                }
                if (data.por_trimestre && data.por_trimestre.length > 0) {
                    DashboardCharts.criarGraficoTrimestral('graficoTrimestral', data.por_trimestre);
                }
            }, 100);
            
        } catch (error) {
            container.innerHTML = `<div class="alert alert-error">Erro ao carregar dashboard: ${error.message}</div>`;
        }
    };
    
    return { render };
})();
