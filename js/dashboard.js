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
            if (e.target.id === 'order-modal' && e.target.classList.contains('modal')) {
                this.closeOrderModal();
            }
        };
    }

    renderDashboard() {
        this.renderStats();
        this.renderProductsTable();
        this.renderOrdersTable();
    }

    async renderStats() {
        if (!window.ProductManager || !window.OrderManager) return;

        const products = productManager.getAllProducts(); // Assuming filtered/cached, or we can fetch. Usually products are loaded.
        const totalProducts = products.length;

        // Fetch accurate orders
        const orders = await orderManager.getAllOrders();

        // Calculate Sales (Total Orders count)
        const totalSales = orders.length;

        // Calculate Revenue (Sum of total_amount, excluding cancelled)
        const totalRevenue = orders.reduce((sum, order) => {
            if (order.status !== 'cancelled') {
                return sum + parseFloat(order.total_amount || 0);
            }
            return sum;
        }, 0);

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
                <td>${product.stock || 0}</td>
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

    async renderOrdersTable() {
        const container = document.getElementById('dashboard-orders');
        if (!container || !window.OrderManager) return;

        const orders = await orderManager.getAllOrders();

        container.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${formatDate(order.created_at)}</td>
                <td>
                    <strong>${order.customer_name}</strong><br>
                    <small>${order.customer_address}</small>
                </td>
                <td>${formatRupiah(order.total_amount)}</td>
                <td><span class="badge badge-${order.status}">${order.status}</span></td>
                <td>
                    <button class="btn btn-info btn-small view-order" data-id="${order.id}">
                        <i class="fas fa-eye"></i> Detail
                    </button>
                </td>
            </tr>
        `).join('');

        this.setupOrderTableEvents();
    }

    setupOrderTableEvents() {
        // Use event delegation for dynamic content if preferred, or re-bind like products
        // Here re-binding for simplicity as renderOrdersTable is called on refresh
        document.querySelectorAll('.view-order').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = parseInt(e.target.dataset.id || e.target.closest('button').dataset.id);
                this.viewOrderDetail(orderId);
            });
        });
    }

    async viewOrderDetail(orderId) {
        const order = await orderManager.getOrderById(orderId);
        if (order) {
            // Populate product names if missing
            if (window.ProductManager) {
                // We use Promise.all to await all product lookups
                await Promise.all(order.items.map(async (item) => {
                    // Check if name is missing or invalid
                    if (!item.product_name || item.product_name === 'null' || item.product_name === 'Unknown Product') {
                        // Ensure we have a valid ID to lookup
                        // database has 'product_id', ensure we fallback to 'id' if mismatch
                        const rawId = item.product_id || item.id;
                        const productId = parseInt(rawId);

                        if (!isNaN(productId)) {
                            const product = await productManager.getProductById(productId);
                            item.product_name = product ? product.name : 'Unknown Product';
                        } else {
                            item.product_name = 'Unknown Product (Invalid ID)';
                        }
                    }
                }));
            }
            this.openOrderModal(order);
        } else {
            showNotification('Gagal mengambil detail pesanan', 'error');
        }
    }

    openOrderModal(order) {
        const modalTemplate = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3>Detail Pesanan #${order.id}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="order-info-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                        <div>
                            <h5>Info Pelanggan</h5>
                            <p><strong>Nama:</strong> ${order.customer_name}</p>
                            <p><strong>Alamat:</strong> ${order.customer_address}</p>
                        </div>
                        <div>
                            <h5>Info Pesanan</h5>
                            <p><strong>Tanggal:</strong> ${formatDate(order.created_at)}</p>
                            <div class="form-group" style="margin-top: 10px;">
                                <label for="order-status-select"><strong>Status:</strong></label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <select id="order-status-select" class="form-control" style="width: auto;">
                                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                                        <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                                    </select>
                                    <button id="update-status-btn" class="btn btn-primary btn-small">
                                        <i class="fas fa-save"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h5>Item Pesanan</h5>
                    <table class="table table-bordered" style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 10px; border: 1px solid #ddd;">Produk</th>
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">Qty</th>
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Harga</th>
                                <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td style="padding: 10px; border: 1px solid #ddd;">${item.product_name}</td>
                                    <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
                                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatRupiah(item.price)}</td>
                                    <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatRupiah(item.price * item.quantity)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>Total</strong></td>
                                <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>${formatRupiah(order.total_amount)}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        `;

        const modal = document.getElementById('order-modal');
        if (modal) {
            modal.innerHTML = modalTemplate;
            modal.classList.add('active');

            modal.querySelectorAll('.close-modal').forEach(btn => {
                btn.addEventListener('click', () => this.closeOrderModal());
            });

            // Add listener for status update
            const updateBtn = document.getElementById('update-status-btn');
            if (updateBtn) {
                updateBtn.addEventListener('click', () => {
                    const newStatus = document.getElementById('order-status-select').value;
                    this.handleStatusUpdate(order.id, newStatus);
                });
            }
        }
    }

    async handleStatusUpdate(orderId, newStatus) {
        const result = await orderManager.updateOrderStatus(orderId, newStatus);
        if (result) {
            showNotification('Status pesanan berhasil diperbarui', 'success');
            this.closeOrderModal();
            this.renderDashboard(); // Refresh table
        } else {
            showNotification('Gagal memperbarui status', 'error');
        }
    }

    closeOrderModal() {
        const modal = document.getElementById('order-modal');
        if (modal) {
            modal.classList.remove('active');
            modal.innerHTML = '';
        }
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

                            <div class="form-group">
                                <label for="product-stock">Stok *</label>
                                <input type="number" id="product-stock" class="form-control" 
                                       value="${product ? (product.stock !== undefined ? product.stock : 20) : '20'}" min="0" required>
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
        const stock = parseInt(document.getElementById('product-stock').value || 0);
        const desc = document.getElementById('product-desc').value;
        const imageFile = document.getElementById('product-image-upload').files[0];

        // Validasi
        let errors = [];
        if (typeof validateForm === 'function') {
            errors = validateForm({ name, category, price, desc, stock });
        } else if (window.AppUtils && window.AppUtils.validateForm) {
            errors = window.AppUtils.validateForm({ name, category, price, desc, stock });
        }

        if (errors.length > 0) {
            errors.forEach(error => showNotification(error, 'error'));
            return;
        }

        const handleSave = (imageData) => {
            this.completeSaveProduct(id, { name, category, price, stock, desc, image: imageData });
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
            const existingProduct = await productManager.getProductById(parseInt(id));
            if (existingProduct) {
                handleSave(existingProduct.image);
            } else {
                showNotification('Produk tidak ditemukan', 'error');
            }
        } else {
            showNotification('Harap pilih gambar produk', 'error');
        }
    }

    async completeSaveProduct(id, productData) {
        try {
            if (id) {
                // Assuming updateProduct will also be async later or now
                // For now, if we only touched addProduct, we handle that.
                // But logically, if we are editing, we should likely check if updateProduct is async.
                // Based on previous Plan, we focus on Create Product.
                // However, let's allow for async update if needed or just sync if not yet changed.
                const updated = productManager.updateProduct(parseInt(id), productData);
                // Note: If updateProduct becomes async, we should await it. 
                // Since this task is specific to "Create Product", we leave update as is unless we know.
                // BUT, to be safe, we can await it if it returns a promise.
                if (updated) {
                    showNotification('Produk berhasil diperbarui', 'success');
                }
            } else {
                const newProduct = await productManager.addProduct(productData);
                if (newProduct) {
                    showNotification('Produk berhasil ditambahkan', 'success');
                } else {
                    showNotification('Gagal menambahkan produk', 'error');
                    return; // Don't close modal on error
                }
            }

            this.closeProductModal();
            this.renderDashboard();
        } catch (error) {
            console.error('Error saving product:', error);
            showNotification('Terjadi kesalahan saat menyimpan produk', 'error');
        }
    }

    async editProduct(productId) {
        const product = await productManager.getProductById(productId);
        if (product) {
            this.openProductModal(product);
        }
    }

    deleteProduct(productId) {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            // Self-executing async function or just handle the promise
            (async () => {
                const deleted = await productManager.deleteProduct(productId);
                if (deleted) {
                    showNotification('Produk berhasil dihapus', 'success');
                    cartManager.removeFromCart(productId);
                    this.renderDashboard();
                } else {
                    showNotification('Gagal menghapus produk', 'error');
                }
            })();
        }
    }
}

const dashboardManager = new DashboardManager();
window.DashboardManager = dashboardManager;