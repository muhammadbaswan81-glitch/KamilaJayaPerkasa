// cart.js - Manajemen keranjang belanja
class CartManager {
    constructor() {
        this.cart = [];
        this.init();
    }

    init() {
        this.loadCart();
    }

    loadCart() {
        const savedCart = getFromLocalStorage('fashionacc_cart');
        this.cart = savedCart || [];
        this.updateCartCount();
        return this.cart;
    }

    saveCart() {
        saveToLocalStorage('fashionacc_cart', this.cart);
        this.updateCartCount();
    }

    updateCartCount() {
        const count = this.getTotalItems();
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
    }

    async addToCart(productId, quantity = 1) {
        try {
            const product = await productManager.getProductById(productId);

            if (!product) {
                showNotification('Produk tidak ditemukan', 'error');
                return false;
            }

            // Cek stok yang tersedia
            const existingItem = this.cart.find(item => item.id === productId);
            const currentQty = existingItem ? existingItem.quantity : 0;
            const requestedQty = currentQty + quantity;

            if (requestedQty > product.stock) {
                showNotification(`Stok tidak mencukupi. Sisa stok: ${product.stock}`, 'error');
                return false;
            }

            const existingItemIndex = this.cart.findIndex(item => item.id === productId);

            if (existingItemIndex !== -1) {
                // Update quantity
                this.cart[existingItemIndex].quantity += quantity;
            } else {
                // Add new item
                this.cart.push({
                    id: productId,
                    quantity: quantity,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    addedAt: new Date().toISOString()
                });
            }

            this.saveCart();
            showNotification(`${product.name} ditambahkan ke keranjang`, 'success');
            return true;
        } catch (error) {
            console.error("Error adding to cart:", error);
            showNotification('Gagal menambahkan ke keranjang', 'error');
            return false;
        }
    }

    removeFromCart(productId) {
        const index = this.cart.findIndex(item => item.id === productId);

        if (index !== -1) {
            const removedItem = this.cart.splice(index, 1)[0];
            this.saveCart();
            showNotification(`${removedItem.name} dihapus dari keranjang`, 'error');
            return removedItem;
        }

        return null;
    }

    async updateQuantity(productId, quantity) {
        const index = this.cart.findIndex(item => item.id === productId);

        if (index !== -1) {
            if (quantity <= 0) {
                return this.removeFromCart(productId);
            }

            // Cek stok
            const product = await productManager.getProductById(productId);
            if (product && quantity > product.stock) {
                showNotification(`Stok tidak mencukupi. Maksimal: ${product.stock}`, 'error');
                return this.cart[index]; // Return existing item without change
            }

            this.cart[index].quantity = quantity;
            this.saveCart();
            return this.cart[index];
        }

        return null;
    }

    async getCartItems() {
        // Use Promise.all to fetch all products in parallel
        return await Promise.all(this.cart.map(async (item) => {
            const product = await productManager.getProductById(item.id);
            // If product fetch fails, use item data as fallback or keep basic info
            const currentPrice = product ? product.price : item.price;

            return {
                ...item,
                product: product || null,
                price: currentPrice, // Update price if changed
                totalPrice: currentPrice * item.quantity
            };
        }));
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    async getSubtotal() {
        const items = await this.getCartItems();
        return items.reduce((total, item) => total + item.totalPrice, 0);
    }

    getTotal() {
        return this.getSubtotal(); // Bisa ditambah ongkir, pajak, dll
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        showNotification('Keranjang dikosongkan', 'info');
    }

    isEmpty() {
        return this.cart.length === 0;
    }

    // Render cart UI
    async renderCart() {
        const emptyCart = document.getElementById('cart-empty');
        const cartContent = document.getElementById('cart-content');
        const cartItemsList = document.getElementById('cart-items-list');

        if (!emptyCart || !cartContent || !cartItemsList) return;

        if (this.isEmpty()) {
            emptyCart.style.display = 'block';
            cartContent.style.display = 'none';
            return;
        }

        emptyCart.style.display = 'none';
        cartContent.style.display = 'grid';

        // Load items - now async
        cartItemsList.innerHTML = '<div class="loading-spinner">Loading cart items...</div>';

        try {
            const cartItems = await this.getCartItems();

            // Render cart items
            cartItemsList.innerHTML = cartItems.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">${formatRupiah(item.price)}</div>
                    </div>
                    <div class="quantity-control">
                        <button class="quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase-quantity" data-id="${item.id}">+</button>
                    </div>
                    <div class="cart-item-price">${formatRupiah(item.totalPrice)}</div>
                    <button class="btn btn-danger btn-small remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');

            // Update totals
            const subtotal = await this.getSubtotal();
            document.getElementById('cart-subtotal').textContent = formatRupiah(subtotal);
            document.getElementById('cart-total').textContent = formatRupiah(subtotal); // Total logic same as subtotal for now

            // Setup event listeners
            this.setupCartEventListeners();
        } catch (error) {
            console.error("Error rendering cart:", error);
            cartItemsList.innerHTML = '<div class="error-message">Gagal memuat keranjang.</div>';
        }
    }

    setupCartEventListeners() {
        // Increase quantity
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = parseInt(e.target.dataset.id);
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    await this.updateQuantity(productId, item.quantity + 1);
                    this.renderCart();
                }
            });
        });

        // Decrease quantity
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', async (e) => {
                const productId = parseInt(e.target.dataset.id);
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    await this.updateQuantity(productId, item.quantity - 1);
                    this.renderCart();
                }
            });
        });

        // Remove item
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                this.removeFromCart(productId);
                this.renderCart();
            });
        });
        // Checkout via API
        const checkoutBtn = document.getElementById('checkout-whatsapp');
        if (checkoutBtn) {
            // Update button text to reflect API (optional, but good for UX)
            // But ID remains for compatibility or we change it. Keeping ID but changing behavior.

            checkoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();

                // 1. Validate Input
                const nameInput = document.getElementById('buyer-name');
                const addressInput = document.getElementById('buyer-address');

                const name = nameInput ? nameInput.value.trim() : '';
                const address = addressInput ? addressInput.value.trim() : '';

                if (!name || !address) {
                    showNotification('Mohon lengkapi Nama dan Alamat', 'error');
                    return;
                }

                if (this.cart.length === 0) {
                    showNotification('Keranjang kosong', 'error');
                    return;
                }

                // 2. Prepare Payload
                // API expects: customer_name, customer_address, items: [{product_id, quantity, price}]
                // item.id is product_id in our cart structure (see addToCart)
                const items = this.cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }));

                const orderData = {
                    customer_name: name,
                    customer_address: address,
                    items: items
                };

                // 3. Call API
                if (window.OrderManager) {
                    checkoutBtn.disabled = true;
                    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

                    const newOrder = await orderManager.createOrder(orderData);

                    checkoutBtn.disabled = false;
                    checkoutBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Checkout via WhatsApp'; // Revert or Change text

                    if (newOrder) {
                        // 4. Handle Success

                        // Prepare WhatsApp data BEFORE clearing cart
                        // We use the data we already prepared for the API
                        let whatsappUrl = '';
                        if (window.WhatsAppManager) {
                            const subtotal = await this.getSubtotal();
                            // items payload has price, quantity, product_id. We need name.
                            // Better resolve full items info or just use what we have.
                            const resolvedItems = await this.getCartItems();

                            // Reduce Stock for each item
                            if (window.ProductManager) {
                                for (const item of resolvedItems) {
                                    await productManager.reduceStock(item.id, item.quantity);
                                }
                            }

                            const message = window.WhatsAppManager.formatWhatsAppMessage(
                                resolvedItems,
                                subtotal,
                                orderData.customer_name,
                                orderData.customer_address
                            );

                            const phoneNumber = window.WhatsAppManager.phoneNumber || "6285246982655";
                            whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                        }

                        this.clearCart();
                        showNotification('Pesanan berhasil dibuat! Membuka WhatsApp...', 'success');

                        if (whatsappUrl) {
                            setTimeout(() => {
                                window.open(whatsappUrl, '_blank');
                            }, 1500);
                        }
                    } else {
                        showNotification('Gagal membuat pesanan via API', 'error');
                    }
                } else {
                    console.error('Order Manager not loaded');
                }
            });
        }
    }
}

// Initialize cart manager
const cartManager = new CartManager();
window.CartManager = cartManager;