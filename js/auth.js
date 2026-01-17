// auth.js - Manajemen login/logout owner
class AuthManager {
    constructor() {
        this.isLoggedIn = false;
        this.ownerCredentials = {
            username: 'owner',
            password: 'owner123'
        };
        this.init();
    }

    init() {
        // Cek status login dari localStorage
        this.checkLoginStatus();

        // Setup event listeners
        this.setupEventListeners();
    }

    checkLoginStatus() {
        const loggedIn = getFromLocalStorage('fashionacc_loggedin') === 'true';
        this.isLoggedIn = loggedIn;

        if (loggedIn) {
            this.showDashboardNav();
        }

        return loggedIn;
    }

    login(username, password) {
        if (username === this.ownerCredentials.username &&
            password === this.ownerCredentials.password) {
            this.isLoggedIn = true;
            saveToLocalStorage('fashionacc_loggedin', 'true');
            this.showDashboardNav();
            showNotification('Login berhasil!', 'success');
            return true;
        }
        return false;
    }

    logout() {
        this.isLoggedIn = false;
        removeFromLocalStorage('fashionacc_loggedin');
        this.hideDashboardNav();
        showNotification('Anda telah logout', 'info');
    }

    showDashboardNav() {
        const dashboardNav = document.getElementById('dashboard-nav');
        const logoutNav = document.getElementById('logout-nav');
        const loginNav = document.getElementById('login-nav');

        if (dashboardNav) dashboardNav.style.display = 'block';
        if (logoutNav) logoutNav.style.display = 'block';
        if (loginNav) loginNav.style.display = 'none';
    }

    hideDashboardNav() {
        const dashboardNav = document.getElementById('dashboard-nav');
        const logoutNav = document.getElementById('logout-nav');
        const loginNav = document.getElementById('login-nav');

        if (dashboardNav) dashboardNav.style.display = 'none';
        if (logoutNav) logoutNav.style.display = 'none';
        if (loginNav) loginNav.style.display = 'block';
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLoginSubmit();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    handleLoginSubmit() {
        const username = document.getElementById('username')?.value;
        const password = document.getElementById('password')?.value;
        const errorElement = document.getElementById('login-error');

        if (!username || !password) {
            if (errorElement) errorElement.textContent = 'Username dan password harus diisi';
            return;
        }

        if (this.login(username, password)) {
            if (errorElement) errorElement.textContent = '';
            if (window.App) window.App.loadPage('dashboard');
        } else {
            if (errorElement) errorElement.textContent = 'Username atau password salah';
        }
    }

    handleLogout() {
        this.logout();
        if (window.App) window.App.loadPage('home');
    }

    getAuthStatus() {
        return this.isLoggedIn;
    }

    requireAuth(pageId) {
        if (pageId === 'dashboard' && !this.isLoggedIn) {
            if (window.App) window.App.loadPage('login');
            return false;
        }
        return true;
    }
}

// Initialize auth manager
const authManager = new AuthManager();
window.AuthManager = authManager;