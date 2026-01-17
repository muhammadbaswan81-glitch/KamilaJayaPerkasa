// dashboard.js - Dashboard dan manajemen produk untuk owner
class DashboardManager {
    constructor() {
        // Init dipanggil manual dari app.js saat halaman dashboard dimuat
    }

    init() {
        this.renderDashboard();
        this.setupDashboardEvents();
    }

    setupDashboardEvents() {
        // Add product button - tombol ini ada di html dashboard page
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            // Hapus listener lama jika ada (clone node hack atau just proper management, 
            // tapi karena ini SPA simple, kita assume init dipanggil sekali per load view)
            addProductBtn.onclick = () => {
                this.openProductModal();
            };
        }

        // Global event listeners (bisa dipasang sekali saja sebenarnya, tapi aman di sini)
        // Close modal buttons delegation
        document.onclick = (e) => {
            if (e.target.classList.contains('close-modal')) {
                this.closeProductModal();
            }
            if (e.target.id === 'product-modal' && e.target.classList.contains('modal')) {
                this.closeProductModal();
            }
        };
    }

    renderDashboard() {
        this.renderStats();
        this.renderProductsTable();
    }

    renderStats() {
        if (!window.ProductManager || !window.CartManager) return;

        const products = productManager.getAllProducts();
        const totalProducts = products.length;
        const totalSales = cartManager.getTotalItems();
        const totalRevenue = cartManager.getSubtotal();

        const statProducts = document.getElementById('stat-products');
        const statSales = document.getElementById('stat-sales');
        const statRevenue = document.getElementById('stat-revenue');

        if (statProducts) statProducts.textContent = totalProducts;
        if (statSales) statSales.textContent = totalSales;
        if (statRevenue) statRevenue.textContent = formatRupiah(totalRevenue);
    }

    renderProductsTable() {
        const container = document.getElementById('dashboard-products');
        if (!container || !window.ProductManager) return;

        const products = productManager.getAllProducts();

        container.innerHTML = products.map((product, index) => `
            <tr>
                <td>${index + 1}</td>
                <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                <td>${product.name}</td>
                <td><span class="product-category">${product.category}</span></td>
                <td>${formatRupiah(product.price)}</td>
                <td>${product.desc.substring(0, 50)}...</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-warning btn-small edit-product" data-id="${product.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-small delete-product" data-id="${product.id}">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.setupProductTableEvents();
    }

    setupProductTableEvents() {
        document.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id || e.target.closest('button').dataset.id);
                this.editProduct(productId);
            });
        });

        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id || e.target.closest('button').dataset.id);
                this.deleteProduct(productId);
            });
        });
    }

    openProductModal(product = null) {
        const modalTemplate = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title">${product ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="product-form">
                        <input type="hidden" id="product-id" value="${product ? product.id : ''}">
                        
                        <div class="form-group">
                            <label for="product-name">Nama Produk *</label>
                            <input type="text" id="product-name" class="form-control" 
                                   value="${product ? product.name : ''}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="product-category">Kategori *</label>
                                <select id="product-category" class="form-control" required>
                                    <option value="">Pilih Kategori</option>
                                    <option value="Perhiasan" ${product && product.category === 'Perhiasan' ? 'selected' : ''}>Perhiasan</option>
                                    <option value="Tas" ${product && product.category === 'Tas' ? 'selected' : ''}>Tas</option>
                                    <option value="Jam Tangan" ${product && product.category === 'Jam Tangan' ? 'selected' : ''}>Jam Tangan</option>
                                    <option value="Hair Accessories" ${product && product.category === 'Hair Accessories' ? 'selected' : ''}>Hair Accessories</option>
                                    <option value="Syal" ${product && product.category === 'Syal' ? 'selected' : ''}>Syal</option>
                                    <option value="Kacamata" ${product && product.category === 'Kacamata' ? 'selected' : ''}>Kacamata</option>
                                    <option value="Lainnya" ${product && product.category === 'Lainnya' ? 'selected' : ''}>Lainnya</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="product-price">Harga (Rp) *</label>
                                <input type="number" id="product-price" class="form-control" 
                                       value="${product ? product.price : ''}" min="0" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="product-image">Gambar Produk ${product ? '(Biarkan kosong jika tidak diganti)' : '*'}</label>
                            <div class="file-upload-container" id="file-upload-container">
                                <label for="product-image-upload" class="file-upload-label">
                                    <i class="fas fa-cloud-upload-alt file-upload-icon"></i>
                                    <span class="file-upload-text">Klik untuk upload gambar produk</span>
                                    <span class="file-upload-text" style="font-size: 0.8rem;">Format: JPG, PNG, GIF (Maks: 2MB)</span>
                                </label>
                                <input type="file" id="product-image-upload" accept="image/*" ${!product ? 'required' : ''}>
                            </div>
                            <div class="image-preview ${product ? 'show' : ''}" id="image-preview">
                                <img id="preview-image" src="${product ? product.image : ''}" alt="Preview Gambar">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="product-desc">Deskripsi Produk *</label>
                            <textarea id="product-desc" class="form-control" rows="4" required>${product ? product.desc : ''}</textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary close-modal" type="button">Batal</button>
                    <button type="submit" form="product-form" class="btn btn-primary" id="save-product">
                        ${product ? 'Update Produk' : 'Simpan Produk'}
                    </button>
                </div>
            </div>
        `;

        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.innerHTML = modalTemplate;
            modal.classList.add('active');

            // Bind form submit event here because form is freshly created
            const productForm = document.getElementById('product-form');
            if (productForm) {
                productForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.saveProduct();
                });
            }

            // Bind close buttons explicitly newly created
            modal.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', () => this.closeProductModal());
            });

            this.setupImageUpload();
        }
    }

    setupImageUpload() {
        const fileInput = document.getElementById('product-image-upload');
        const previewContainer = document.getElementById('image-preview');
        const previewImage = document.getElementById('preview-image');

        if (!fileInput || !previewContainer || !previewImage) return;

        fileInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                // Gunakan utils global
                if (window.AppUtils && window.AppUtils.handleImageUpload) {
                    window.AppUtils.handleImageUpload(file, (imageData, error) => {
                        if (error) {
                            showNotification(error, 'error');
                            this.value = '';
                            return;
                        }
                        previewImage.src = imageData;
                        previewContainer.classList.add('show');
                    });
                } else if (typeof handleImageUpload === 'function') {
                    handleImageUpload(file, (imageData, error) => {
                        if (error) {
                            showNotification(error, 'error');
                            this.value = '';
                            return;
                        }
                        previewImage.src = imageData;
                        previewContainer.classList.add('show');
                    });
                }
            }
        });
    }

    closeProductModal() {
        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.innerHTML = '';
        }
    }

    async saveProduct() {
        const id = document.getElementById('product-id').value;
        const name = document.getElementById('product-name').value;
        const category = document.getElementById('product-category').value;
        const price = parseInt(document.getElementById('product-price').value);
        const desc = document.getElementById('product-desc').value;
        const imageFile = document.getElementById('product-image-upload').files[0];

        // Validasi
        let errors = [];
        if (typeof validateForm === 'function') {
            errors = validateForm({ name, category, price, desc });
        } else if (window.AppUtils && window.AppUtils.validateForm) {
            errors = window.AppUtils.validateForm({ name, category, price, desc });
        }

        if (errors.length > 0) {
            errors.forEach(error => showNotification(error, 'error'));
            return;
        }

        const handleSave = (imageData) => {
            this.completeSaveProduct(id, { name, category, price, desc, image: imageData });
        };

        if (imageFile) {
            // New image upload
            const uploadFn = (window.AppUtils && window.AppUtils.handleImageUpload) ? window.AppUtils.handleImageUpload : handleImageUpload;
            uploadFn(imageFile, (image, error) => {
                if (error) {
                    showNotification(error, 'error');
                    return;
                }
                handleSave(image);
            });
        } else if (id) {
            // Existing image usage
            const existingProduct = productManager.getProductById(parseInt(id));
            if (existingProduct) {
                handleSave(existingProduct.image);
            } else {
                showNotification('Produk tidak ditemukan', 'error');
            }
        } else {
            showNotification('Harap pilih gambar produk', 'error');
        }
    }

    completeSaveProduct(id, productData) {
        if (id) {
            const updated = productManager.updateProduct(parseInt(id), productData);
            if (updated) {
                showNotification('Produk berhasil diperbarui', 'success');
            }
        } else {
            const newProduct = productManager.addProduct(productData);
            if (newProduct) {
                showNotification('Produk berhasil ditambahkan', 'success');
            }
        }

        this.closeProductModal();
        this.renderDashboard();
    }

    editProduct(productId) {
        const product = productManager.getProductById(productId);
        if (product) {
            this.openProductModal(product);
        }
    }

    deleteProduct(productId) {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            const deleted = productManager.deleteProduct(productId);
            if (deleted) {
                showNotification('Produk berhasil dihapus', 'success');
                cartManager.removeFromCart(productId);
                this.renderDashboard();
            }
        }
    }
}

const dashboardManager = new DashboardManager();
window.DashboardManager = dashboardManager;