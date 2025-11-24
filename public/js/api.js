// Módulo de API
const API = (() => {
    const BASE_URL = '/api';
    
    // Obter token do localStorage
    const getToken = () => localStorage.getItem('token');
    
    // Headers padrão
    const getHeaders = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    });
    
    // Requisição genérica
    const request = async (url, options = {}) => {
        try {
            const response = await fetch(`${BASE_URL}${url}`, {
                ...options,
                headers: {
                    ...getHeaders(),
                    ...options.headers
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.erro || 'Erro na requisição');
            }
            
            return data;
        } catch (error) {
            console.error('Erro na API:', error);
            throw error;
        }
    };
    
    return {
        // Auth
        login: (email, senha) => fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        }).then(r => r.json()),
        
        verificarToken: () => request('/auth/verificar'),
        
        alterarSenha: (senhaAtual, novaSenha) => request('/auth/alterar-senha', {
            method: 'POST',
            body: JSON.stringify({ senhaAtual, novaSenha })
        }),
        
        // Usuários
        usuarios: {
            listar: () => request('/usuarios'),
            buscar: (id) => request(`/usuarios/${id}`),
            criar: (dados) => request('/usuarios', {
                method: 'POST',
                body: JSON.stringify(dados)
            }),
            atualizar: (id, dados) => request(`/usuarios/${id}`, {
                method: 'PUT',
                body: JSON.stringify(dados)
            }),
            deletar: (id) => request(`/usuarios/${id}`, { method: 'DELETE' })
        },
        
        // Categorias
        categorias: {
            listar: (ativo) => request(`/categorias${ativo !== undefined ? '?ativo=' + ativo : ''}`),
            buscar: (id) => request(`/categorias/${id}`),
            criar: (dados) => request('/categorias', {
                method: 'POST',
                body: JSON.stringify(dados)
            }),
            atualizar: (id, dados) => request(`/categorias/${id}`, {
                method: 'PUT',
                body: JSON.stringify(dados)
            }),
            deletar: (id) => request(`/categorias/${id}`, { method: 'DELETE' }),
            importar: async (arquivo) => {
                const formData = new FormData();
                formData.append('arquivo', arquivo);
                const response = await fetch(`${BASE_URL}/categorias/importar`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${getToken()}` },
                    body: formData
                });
                return response.json();
            }
        },
        
        // Departamentos
        departamentos: {
            listar: (ativo) => request(`/departamentos${ativo !== undefined ? '?ativo=' + ativo : ''}`),
            buscar: (id) => request(`/departamentos/${id}`),
            criar: (dados) => request('/departamentos', {
                method: 'POST',
                body: JSON.stringify(dados)
            }),
            atualizar: (id, dados) => request(`/departamentos/${id}`, {
                method: 'PUT',
                body: JSON.stringify(dados)
            }),
            deletar: (id) => request(`/departamentos/${id}`, { method: 'DELETE' })
        },
        
        // Períodos
        periodos: {
            listar: (ano) => request(`/periodos${ano ? '?ano=' + ano : ''}`),
            buscar: (id) => request(`/periodos/${id}`),
            criar: (dados) => request('/periodos', {
                method: 'POST',
                body: JSON.stringify(dados)
            }),
            abrir: (id) => request(`/periodos/${id}/abrir`, { method: 'POST' }),
            fechar: (id) => request(`/periodos/${id}/fechar`, { method: 'POST' }),
            deletar: (id) => request(`/periodos/${id}`, { method: 'DELETE' })
        },
        
        // Orçamentos
        orcamentos: {
            listar: (params) => {
                const query = new URLSearchParams(params).toString();
                return request(`/orcamentos${query ? '?' + query : ''}`);
            },
            buscar: (id) => request(`/orcamentos/${id}`),
            criar: (dados) => request('/orcamentos', {
                method: 'POST',
                body: JSON.stringify(dados)
            }),
            adicionarItem: (orcamentoId, dados) => request(`/orcamentos/${orcamentoId}/itens`, {
                method: 'POST',
                body: JSON.stringify(dados)
            }),
            atualizarItem: (orcamentoId, itemId, dados) => request(`/orcamentos/${orcamentoId}/itens/${itemId}`, {
                method: 'PUT',
                body: JSON.stringify(dados)
            }),
            deletarItem: (orcamentoId, itemId) => request(`/orcamentos/${orcamentoId}/itens/${itemId}`, {
                method: 'DELETE'
            }),
            submeter: (id) => request(`/orcamentos/${id}/submeter`, { method: 'POST' }),
            aprovar: (id, observacao) => request(`/orcamentos/${id}/aprovar`, {
                method: 'POST',
                body: JSON.stringify({ observacao })
            }),
            rejeitar: (id, observacao) => request(`/orcamentos/${id}/rejeitar`, {
                method: 'POST',
                body: JSON.stringify({ observacao })
            }),
            lancarRealizado: (orcamentoId, dados) => request(`/orcamentos/${orcamentoId}/lancar-realizado`, {
                method: 'POST',
                body: JSON.stringify(dados)
            })
        },
        
        // Contestações
        contestacoes: {
            listar: (status) => request(`/contestacoes${status ? '?status=' + status : ''}`),
            buscar: (id) => request(`/contestacoes/${id}`),
            criar: (dados) => request('/contestacoes', {
                method: 'POST',
                body: JSON.stringify(dados)
            }),
            atualizar: (id, dados) => request(`/contestacoes/${id}`, {
                method: 'PUT',
                body: JSON.stringify(dados)
            }),
            deletar: (id) => request(`/contestacoes/${id}`, { method: 'DELETE' })
        },
        
        // Notificações
        notificacoes: {
            listar: (lida) => request(`/notificacoes${lida !== undefined ? '?lida=' + lida : ''}`),
            contarNaoLidas: () => request('/notificacoes/nao-lidas/count'),
            marcarLida: (id) => request(`/notificacoes/${id}/lida`, { method: 'PUT' }),
            marcarTodasLidas: () => request('/notificacoes/todas/lida', { method: 'PUT' }),
            deletar: (id) => request(`/notificacoes/${id}`, { method: 'DELETE' })
        },
        
        // Dashboard
        dashboard: {
            geral: (ano) => request(`/dashboard${ano ? '?ano=' + ano : ''}`),
            departamento: (id, ano) => request(`/dashboard/departamento/${id}${ano ? '?ano=' + ano : ''}`)
        },
        
        // Relatórios
        relatorios: {
            departamento: (id, ano) => request(`/relatorios/departamento/${id}${ano ? '?ano=' + ano : ''}`),
            consolidado: (ano) => request(`/relatorios/consolidado${ano ? '?ano=' + ano : ''}`),
            variacao: (ano, departamento_id) => {
                const params = new URLSearchParams();
                if (ano) params.append('ano', ano);
                if (departamento_id) params.append('departamento_id', departamento_id);
                return request(`/relatorios/variacao?${params.toString()}`);
            }
        },
        
        // Logs
        logs: {
            listar: (params) => {
                const query = new URLSearchParams(params).toString();
                return request(`/logs${query ? '?' + query : ''}`);
            },
            buscar: (id) => request(`/logs/${id}`),
            stats: (data_inicio, data_fim) => {
                const params = new URLSearchParams();
                if (data_inicio) params.append('data_inicio', data_inicio);
                if (data_fim) params.append('data_fim', data_fim);
                return request(`/logs/stats/resumo?${params.toString()}`);
            }
        },
        
        // Backup
        backup: {
            listar: () => request('/backup'),
            criar: () => request('/backup/criar', { method: 'POST' }),
            restaurar: (arquivo) => request('/backup/restaurar', {
                method: 'POST',
                body: JSON.stringify({ arquivo })
            }),
            download: (arquivo) => `${BASE_URL}/backup/download/${arquivo}`
        }
    };
})();
