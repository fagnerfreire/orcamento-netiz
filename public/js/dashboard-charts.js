// Módulo de Gráficos do Dashboard
const DashboardCharts = (() => {
    let chartsInstances = {};
    
    // Destruir gráficos existentes
    const destroyCharts = () => {
        Object.values(chartsInstances).forEach(chart => {
            if (chart) chart.destroy();
        });
        chartsInstances = {};
    };
    
    // Gráfico de evolução mensal
    const criarGraficoMensal = (elementId, data) => {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;
        
        const meses = data.map(d => Utils.getNomeMes(d.mes).substring(0, 3));
        const orcado = data.map(d => d.orcado || 0);
        const realizado = data.map(d => d.realizado || 0);
        
        chartsInstances[elementId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [
                    {
                        label: 'Orçado',
                        data: orcado,
                        borderColor: '#0066CC',
                        backgroundColor: 'rgba(0, 102, 204, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Realizado',
                        data: realizado,
                        borderColor: '#00CC66',
                        backgroundColor: 'rgba(0, 204, 102, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Evolução Mensal'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + Utils.formatarMoeda(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
                            }
                        }
                    }
                }
            }
        });
    };
    
    // Gráfico de pizza por categoria
    const criarGraficoCategorias = (elementId, data) => {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;
        
        const labels = data.map(d => d.categoria);
        const valores = data.map(d => d.total_orcado || d.orcado || 0);
        
        const cores = [
            '#0066CC', '#00CC66', '#FFD700', '#FF6B6B', '#4ECDC4',
            '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3', '#FFFFD2'
        ];
        
        chartsInstances[elementId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: valores,
                    backgroundColor: cores,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    title: {
                        display: true,
                        text: 'Distribuição por Categoria'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = Utils.formatarMoeda(context.parsed);
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = ((context.parsed / total) * 100).toFixed(1);
                                return label + ': ' + value + ' (' + percent + '%)';
                            }
                        }
                    }
                }
            }
        });
    };
    
    // Gráfico de barras por departamento
    const criarGraficoDepartamentos = (elementId, data) => {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;
        
        const labels = data.map(d => d.nome);
        const orcado = data.map(d => d.total_orcado || 0);
        const realizado = data.map(d => d.total_realizado || 0);
        
        chartsInstances[elementId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Orçado',
                        data: orcado,
                        backgroundColor: 'rgba(0, 102, 204, 0.7)',
                        borderColor: '#0066CC',
                        borderWidth: 1
                    },
                    {
                        label: 'Realizado',
                        data: realizado,
                        backgroundColor: 'rgba(0, 204, 102, 0.7)',
                        borderColor: '#00CC66',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Orçamento por Departamento'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + Utils.formatarMoeda(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
                            }
                        }
                    }
                }
            }
        });
    };
    
    // Gráfico de comparação trimestral
    const criarGraficoTrimestral = (elementId, data) => {
        const ctx = document.getElementById(elementId);
        if (!ctx) return;
        
        const labels = data.map(d => d.trimestre);
        const orcado = data.map(d => d.orcado || 0);
        const realizado = data.map(d => d.realizado || 0);
        
        chartsInstances[elementId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Orçado',
                        data: orcado,
                        backgroundColor: '#0066CC'
                    },
                    {
                        label: 'Realizado',
                        data: realizado,
                        backgroundColor: '#00CC66'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Comparativo Trimestral'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + Utils.formatarMoeda(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + (value / 1000).toFixed(0) + 'k';
                            }
                        }
                    }
                }
            }
        });
    };
    
    return {
        destroyCharts,
        criarGraficoMensal,
        criarGraficoCategorias,
        criarGraficoDepartamentos,
        criarGraficoTrimestral
    };
})();
