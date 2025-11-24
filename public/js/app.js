// Aplicação Principal
const App = (() => {
    let currentPage = 'dashboard';
    
    const init = () => {
        Auth.init();
        
        if (!Auth.isAuthenticated()) {
            showLoginScreen();
        } else {
            showAppScreen();
        }
        
        setupEventListeners();
    };
    
    const showLoginScreen = () => {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appScreen').style.display = 'none';
    };
    
    const showAppScreen = async () => {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appScreen').style.display = 'flex';
        
        const user = Auth.getUser();
        if (user) {
            document.getElementById('userName').textContent = user.nome;
            document.getElementById('userPerfil').textContent = user.perfil.toUpperCase();
            
            // Mostrar/ocultar menus baseado no perfil
            updateMenuVisibility();
            
            // Carregar dashboard inicial
            loadPage('dashboard');
            
            // Atualizar notificações
            updateNotifications();
        }
    };
    
    const updateMenuVisibility = () => {
        const user = Auth.getUser();
        if (!user) return;
        
        // Ocultar itens admin-only
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = Auth.hasPerfil('admin') ? 'flex' : 'none';
        });
        
        // Ocultar itens gestor-only
        document.querySelectorAll('.gestor-only').forEach(el => {
            el.style.display = Auth.hasPerfil('admin', 'gestor') ? 'flex' : 'none';
        });
        
        // Ocultar itens financeiro-only
        document.querySelectorAll('.financeiro-only').forEach(el => {
            el.style.display = Auth.hasPerfil('admin', 'financeiro') ? 'flex' : 'none';
        });
    };
    
    const loadPage = (pageName) => {
        currentPage = pageName;
        
        // Atualizar menu ativo
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageName) {
                link.classList.add('active');
            }
        });
        
        // Carregar conteúdo da página
        const pageContent = document.getElementById('pageContent');
        
        switch(pageName) {
            case 'dashboard':
                Dashboard.render(pageContent);
                break;
            case 'orcamentos':
                Orcamentos.render(pageContent);
                break;
            case 'departamentos':
                Departamentos.render(pageContent);
                break;
            case 'categorias':
                Categorias.render(pageContent);
                break;
            case 'usuarios':
                Usuarios.render(pageContent);
                break;
            case 'periodos':
                Periodos.render(pageContent);
                break;
            case 'contestacoes':
                Contestacoes.render(pageContent);
                break;
            case 'relatorios':
                Relatorios.render(pageContent);
                break;
            case 'logs':
                Logs.render(pageContent);
                break;
            case 'backup':
                Backup.render(pageContent);
                break;
            default:
                pageContent.innerHTML = '<div class="card"><p>Página não encontrada</p></div>';
        }
        
        // Fechar sidebar em mobile
        document.getElementById('sidebar').classList.remove('active');
    };
    
    const updateNotifications = async () => {
        try {
            const result = await API.notificacoes.contarNaoLidas();
            const badge = document.getElementById('notificationBadge');
            if (result.total > 0) {
                badge.textContent = result.total;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        } catch (error) {
            console.error('Erro ao atualizar notificações:', error);
        }
    };
    
    const setupEventListeners = () => {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const senha = document.getElementById('loginPassword').value;
            const errorDiv = document.getElementById('loginError');
            
            try {
                await Auth.login(email, senha);
                showAppScreen();
            } catch (error) {
                errorDiv.textContent = error.message || 'Erro ao fazer login';
                errorDiv.style.display = 'block';
            }
        });
        
        // Logout
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Deseja realmente sair?')) {
                Auth.logout();
            }
        });
        
        // Menu toggle (mobile)
        document.getElementById('menuToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });
        
        // Navegação
        document.querySelectorAll('.nav-link[data-page]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                loadPage(page);
            });
        });
    };
    
    return {
        init,
        loadPage,
        updateNotifications
    };
})();

// Iniciar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
