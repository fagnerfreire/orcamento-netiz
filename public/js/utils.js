// Utilitários
const Utils = (() => {
    // Formatar moeda
    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    };
    
    // Formatar data
    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    };
    
    // Formatar data e hora
    const formatarDataHora = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleString('pt-BR');
    };
    
    // Mostrar alerta
    const mostrarAlerta = (mensagem, tipo = 'success') => {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${tipo}`;
        alertDiv.textContent = mensagem;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    };
    
    // Confirmar ação
    const confirmar = (mensagem) => {
        return confirm(mensagem);
    };
    
    // Obter status em português
    const traduzirStatus = (status) => {
        const traducoes = {
            'rascunho': 'Rascunho',
            'aguardando_aprovacao': 'Aguardando Aprovação',
            'aprovado': 'Aprovado',
            'rejeitado': 'Rejeitado',
            'em_revisao': 'Em Revisão',
            'pendente': 'Pendente',
            'analisando': 'Analisando',
            'resolvido': 'Resolvido',
            'aberto': 'Aberto',
            'fechado': 'Fechado'
        };
        return traducoes[status] || status;
    };
    
    // Obter classe CSS do status
    const getStatusClass = (status) => {
        const classes = {
            'aprovado': 'status-aprovado',
            'rejeitado': 'status-rejeitado',
            'aguardando_aprovacao': 'status-pendente',
            'pendente': 'status-pendente',
            'rascunho': 'status-rascunho',
            'em_revisao': 'status-pendente'
        };
        return classes[status] || 'status-rascunho';
    };
    
    // Nome do mês
    const getNomeMes = (mes) => {
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return meses[mes - 1] || '';
    };
    
    // Calcular percentual
    const calcularPercentual = (realizado, orcado) => {
        if (!orcado || orcado === 0) return 0;
        return ((realizado / orcado) * 100).toFixed(2);
    };
    
    // Debounce para inputs
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };
    
    // Loading state
    const showLoading = (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading"><i class="fas fa-spinner"></i><p>Carregando...</p></div>';
        }
    };
    
    // Download CSV
    const downloadCSV = (data, filename) => {
        const csv = data.map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };
    
    return {
        formatarMoeda,
        formatarData,
        formatarDataHora,
        mostrarAlerta,
        confirmar,
        traduzirStatus,
        getStatusClass,
        getNomeMes,
        calcularPercentual,
        debounce,
        showLoading,
        downloadCSV
    };
})();
