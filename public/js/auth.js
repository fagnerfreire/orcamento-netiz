// Módulo de Autenticação
const Auth = (() => {
    let currentUser = null;
    
    const init = () => {
        const token = localStorage.getItem('token');
        if (token) {
            verificarToken();
        }
    };
    
    const login = async (email, senha) => {
        try {
            const response = await API.login(email, senha);
            if (response.token) {
                localStorage.setItem('token', response.token);
                currentUser = response.usuario;
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    };
    
    const logout = () => {
        localStorage.removeItem('token');
        currentUser = null;
        window.location.reload();
    };
    
    const verificarToken = async () => {
        try {
            const response = await API.verificarToken();
            if (response.valido) {
                currentUser = response.usuario;
                return true;
            }
            return false;
        } catch (error) {
            logout();
            return false;
        }
    };
    
    const isAuthenticated = () => {
        return !!localStorage.getItem('token');
    };
    
    const getUser = () => currentUser;
    
    const hasPerfil = (...perfis) => {
        if (!currentUser) return false;
        return perfis.includes(currentUser.perfil);
    };
    
    return {
        init,
        login,
        logout,
        isAuthenticated,
        getUser,
        hasPerfil
    };
})();
