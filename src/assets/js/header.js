// Función para manejar el estado activo del header
window.initHeader = function() {
    // Marcar enlace activo
    const currentPath = window.location.pathname;
    document.querySelectorAll('nav a.nav-link').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.endsWith(linkPath) || (linkPath.endsWith('home.html') && (currentPath.endsWith('/') || currentPath.endsWith('index.html')))) {
            link.classList.add('text-indigo-700', 'font-bold');
        } else {
            link.classList.remove('text-indigo-700', 'font-bold');
        }
    });
    // Mostrar/ocultar enlaces según sesión
    const auth = window.firebaseAuth;
    const perfilLink = document.querySelector('[data-auth="user"]');
    const loginLink = document.querySelector('[data-auth="login"]');
    const logoutBtn = document.getElementById('logoutButton');
    if (!auth) return;
    auth.onAuthStateChanged(user => {
        if (user) {
            if (perfilLink) perfilLink.style.display = '';
            if (loginLink) loginLink.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = '';
        } else {
            if (perfilLink) perfilLink.style.display = 'none';
            if (loginLink) loginLink.style.display = '';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    });
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await auth.signOut();
            window.location.reload();
        };
    }
    if (loginLink) {
        loginLink.onclick = (e) => {
            e.preventDefault();
            if (window.showAuthModal) window.showAuthModal();
        };
    }
}; 