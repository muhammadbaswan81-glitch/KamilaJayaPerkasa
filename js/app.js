// app.js - Aplikasi utama dan routing
class App {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        // Load data
        if (window.ProductManager) productManager.loadProducts();
        if (window.CartManager) cartManager.loadCart();
        if (window.AuthManager) authManager.checkLoginStatus();

        // Setup event listeners
        this.setupEventListeners();

        // Load initial page
        this.loadPage('home');

        console.log('Kamila Jaya Perkasa App initialized');
    }

    setupEventListeners() {
        // Navigation links
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link, .logo, .btn[data-page]') ||
                e.target.closest('.nav-link, .logo, .btn[data-page]')) {
                e.preventDefault();

                const element = e.target.matches('[data-page]') ? e.target : e.target.closest('[data-page]');
                const pageId = element.dataset.page;

                if (window.AuthManager && authManager.requireAuth(pageId)) {
                    this.loadPage(pageId);
                }
            }
        });

        // Add to cart buttons (delegated)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-to-cart') || e.target.closest('.add-to-cart')) {
                const button = e.target.matches('.add-to-cart') ? e.target : e.target.closest('.add-to-cart');
                const productId = parseInt(button.dataset.id);

                if (productId && window.CartManager) {
                    cartManager.addToCart(productId);
                }
            }
        });
    }

    async loadPage(pageId) {
        this.currentPage = pageId;

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            }
        });

        // Load page content
        const mainContent = document.getElementById('main-content');

        switch (pageId) {
            case 'home':
                mainContent.innerHTML = this.getHomePage();
                this.renderFeaturedProducts();
                break;

            case 'products':
                mainContent.innerHTML = this.getProductsPage();
                this.renderAllProducts();
                break;

            case 'cart':
                mainContent.innerHTML = this.getCartPage();
                if (window.CartManager) cartManager.renderCart();
                break;

            case 'login':
                mainContent.innerHTML = this.getLoginPage();
                if (window.AuthManager) authManager.setupEventListeners();
                break;

            case 'dashboard':
                if (window.AuthManager && authManager.getAuthStatus()) {
                    mainContent.innerHTML = this.getDashboardPage();
                    if (window.DashboardManager) dashboardManager.init();
                } else {
                    this.loadPage('login');
                }
                break;

            default:
                mainContent.innerHTML = this.getHomePage();
                this.renderFeaturedProducts();
        }
    }

    renderFeaturedProducts() {
        const container = document.getElementById('featured-products');
        if (!container || !window.ProductManager) return;

        const products = productManager.getFeaturedProducts();
        container.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    renderAllProducts() {
        const container = document.getElementById('all-products');
        if (!container || !window.ProductManager) return;

        const products = productManager.getAllProducts();
        container.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        return `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-desc">${product.desc}</p>
                    <div class="product-price">${formatRupiah(product.price)}</div>
                    <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                        <i class="fas fa-cart-plus"></i> Tambah ke Keranjang
                    </button>
                </div>
            </div>
        `;
    }

    getHomePage() {
        return `
            <section id="home-page" class="page active">
                <div class="hero">
                    <h2>Temukan Aksesoris Fashion Terbaik</h2>
                    <p>Kami menyediakan berbagai macam aksesoris fashion wanita berkualitas tinggi dengan harga terjangkau. Mulai dari perhiasan, tas, jam tangan, hingga aksesoris rambut.</p>
                    <div class="hero-buttons">
                        <a href="#" class="btn btn-primary" data-page="products">
                            <i class="fas fa-shopping-bag"></i> Belanja Sekarang
                        </a>
                        <a href="#" class="btn btn-secondary" data-page="products">
                            <i class="fas fa-eye"></i> Lihat Koleksi
                        </a>
                    </div>
                </div>
                
                <div class="page-header">
                    <h2>Produk Terpopuler</h2>
                    <p>Pilihan aksesoris fashion terbaik untuk melengkapi gaya harian Anda</p>
                </div>
                
                <div class="products-grid" id="featured-products">
                    <!-- Featured products will be loaded here -->
                </div>
                
                <div class="whatsapp-checkout">
                    <h4>Mudah Berbelanja dengan WhatsApp</h4>
                    <p>Setelah memilih produk, Anda dapat langsung checkout melalui WhatsApp. Daftar belanjaan akan otomatis dikirim ke penjual.</p>
                    <a href="#" class="btn btn-whatsapp" data-page="cart">
                        <i class="fab fa-whatsapp"></i> Belanja via WhatsApp
                    </a>
                </div>
            </section>
        `;
    }

    getProductsPage() {
        return `
            <section id="products-page" class="page active">
                <div class="page-header">
                    <h2>Semua Produk</h2>
                    <p>Temukan semua koleksi aksesoris fashion kami</p>
                </div>
                
                <div class="products-grid" id="all-products">
                    <!-- All products will be loaded here -->
                </div>
            </section>
        `;
    }

    getCartPage() {
        return `
            <section id="cart-page" class="page active">
                <div class="page-header">
                    <h2>Keranjang Belanja</h2>
                    <p>Produk yang telah Anda pilih untuk dibeli</p>
                </div>
                
                <div id="cart-empty" class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <h3>Keranjang Anda Kosong</h3>
                    <p>Tambahkan produk dari halaman produk untuk memulai belanja</p>
                    <a href="#" class="btn btn-primary mt-3" data-page="products">
                        <i class="fas fa-shopping-bag"></i> Mulai Belanja
                    </a>
                </div>
                
                <div class="cart-container" id="cart-content" style="display: none;">
                    <div class="cart-items">
                        <h3>Daftar Belanjaan</h3>
                        <div id="cart-items-list">
                            <!-- Cart items will be loaded here -->
                        </div>
                    </div>
                    
                    <div class="cart-summary">
                        <h3>Ringkasan Belanja</h3>
                        <div class="summary-row">
                            <span>Subtotal</span>
                            <span id="cart-subtotal">Rp 0</span>
                        </div>
                        <div class="summary-row">
                            <span>Ongkos Kirim</span>
                            <span id="cart-shipping">Gratis</span>
                        </div>
                        <div class="summary-row summary-total">
                            <span>Total</span>
                            <span id="cart-total">Rp 0</span>
                        </div>
                        
                        <div class="whatsapp-checkout">
                            <h4>Data Pengiriman</h4>
                            <div class="form-group" style="margin-bottom: 10px;">
                                <label for="buyer-name" style="display: block; text-align: left; margin-bottom: 5px;">Nama Lengkap</label>
                                <input type="text" id="buyer-name" class="form-control" placeholder="Masukkan nama lengkap" required style="width: 100%; padding: 8px; box-sizing: border-box;">
                            </div>
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label for="buyer-address" style="display: block; text-align: left; margin-bottom: 5px;">Alamat Lengkap</label>
                                <textarea id="buyer-address" class="form-control" rows="3" placeholder="Masukkan alamat lengkap pengiriman" required style="width: 100%; padding: 8px; box-sizing: border-box;"></textarea>
                            </div>

                            <h4>Selesaikan Pembelian via WhatsApp</h4>
                            <p>Klik tombol di bawah untuk mengirim pesanan ke penjual via WhatsApp</p>
                            <button class="btn btn-whatsapp btn-block" id="checkout-whatsapp">
                                <i class="fab fa-whatsapp"></i> Checkout via WhatsApp
                            </button>
                            <p class="small-text mt-2">Pastikan Anda telah menginstal aplikasi WhatsApp</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    getLoginPage() {
        return `
            <section id="login-page" class="page active">
                <div class="page-header">
                    <h2>Login Owner</h2>
                    <p>Masuk ke dashboard untuk mengelola produk</p>
                </div>
                
                <div class="login-container">
                    <div class="login-card">
                        <h2><i class="fas fa-lock"></i> Login Owner</h2>
                        <form id="login-form" class="login-form">
                            <div class="form-group">
                                <label for="username">Username</label>
                                <input type="text" id="username" placeholder="Masukkan username" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="password">Password</label>
                                <input type="password" id="password" placeholder="Masukkan password" required>
                            </div>
                            
                            <button type="submit" class="login-btn">Login</button>
                            <div class="login-error" id="login-error"></div>
                        </form>
                    </div>
                </div>
            </section>
        `;
    }

    getDashboardPage() {
        return `
            <section id="dashboard-page" class="page active">
                <div class="page-header">
                    <h2>Dashboard Owner</h2>
                    <div class="dashboard-actions">
                        <button class="btn btn-primary" id="add-product-btn">
                            <i class="fas fa-plus"></i> Tambah Produk
                        </button>
                    </div>
                </div>

                <div class="dashboard-stats">
                    <div class="stat-card">
                        <div class="stat-icon products"><i class="fas fa-box"></i></div>
                        <div class="stat-info">
                            <h3 id="stat-products">0</h3>
                            <p>Total Produk</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon sales"><i class="fas fa-shopping-cart"></i></div>
                        <div class="stat-info">
                            <h3 id="stat-sales">0</h3>
                            <p>Total Penjualan</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon revenue"><i class="fas fa-money-bill-wave"></i></div>
                        <div class="stat-info">
                            <h3 id="stat-revenue">Rp 0</h3>
                            <p>Total Pendapatan</p>
                        </div>
                    </div>
                </div>

                <div class="products-table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Gambar</th>
                                <th>Nama Produk</th>
                                <th>Kategori</th>
                                <th>Harga</th>
                                <th>Deskripsi</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody id="dashboard-products">
                            <!-- Products will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </section>
        `;
    }
}

// Initialize app
const app = new App();
window.App = app;