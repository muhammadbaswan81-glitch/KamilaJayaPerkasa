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

    addToCart(productId, quantity = 1) {
        const product = productManager.getProductById(productId);

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

    updateQuantity(productId, quantity) {
        const index = this.cart.findIndex(item => item.id === productId);

        if (index !== -1) {
            if (quantity <= 0) {
                return this.removeFromCart(productId);
            }

            // Cek stok
            const product = productManager.getProductById(productId);
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

    getCartItems() {
        return this.cart.map(item => {
            const product = productManager.getProductById(item.id);
            return {
                ...item,
                product: product || null,
                totalPrice: product ? product.price * item.quantity : 0
            };
        });
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    getSubtotal() {
        return this.getCartItems().reduce((total, item) => total + item.totalPrice, 0);
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
    renderCart() {
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

        const cartItems = this.getCartItems();

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
        document.getElementById('cart-subtotal').textContent = formatRupiah(this.getSubtotal());
        document.getElementById('cart-total').textContent = formatRupiah(this.getTotal());

        // Setup event listeners
        this.setupCartEventListeners();
    }

    setupCartEventListeners() {
        // Increase quantity
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                    this.renderCart();
                }
            });
        });

        // Decrease quantity
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.dataset.id);
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity - 1);
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
        // Checkout via WhatsApp
        const checkoutBtn = document.getElementById('checkout-whatsapp');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.WhatsAppManager) {
                    whatsappManager.processCheckout();
                } else {
                    console.error('WhatsApp Manager not loaded');
                    showNotification('Gagal memuat WhatsApp Manager', 'error');
                }
            });
        }
    }
}

// Initialize cart manager
const cartManager = new CartManager();
window.CartManager = cartManager;