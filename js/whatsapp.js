// whatsapp.js - Integrasi WhatsApp untuk checkout
class WhatsAppManager {
    constructor() {
        this.phoneNumber = "6285246982655"; // Format internasional (tanpa + atau 0 di depan)
    }

    processCheckout() {
        if (cartManager.isEmpty()) {
            showNotification('Keranjang belanja kosong', 'error');
            return;
        }

        const nameInput = document.getElementById('buyer-name');
        const addressInput = document.getElementById('buyer-address');

        const name = nameInput ? nameInput.value.trim() : '';
        const address = addressInput ? addressInput.value.trim() : '';

        if (!name) {
            showNotification('Mohon isi Nama Lengkap Anda', 'error');
            if (nameInput) nameInput.focus();
            return;
        }

        if (!address) {
            showNotification('Mohon isi Alamat Lengkap Pengiriman', 'error');
            if (addressInput) addressInput.focus();
            return;
        }

        const cartItems = cartManager.getCartItems();
        const subtotal = cartManager.getSubtotal();

        // Format pesan untuk WhatsApp
        const message = this.formatWhatsAppMessage(cartItems, subtotal, name, address);

        // Encode message untuk URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${this.phoneNumber}?text=${encodedMessage}`;

        // Open WhatsApp
        window.open(whatsappUrl, '_blank');

        // Kosongkan keranjang setelah checkout
        cartManager.clearCart();

        showNotification('Pesanan terkirim! Harap SCREENSHOT halaman ini dan kirim ke WhatsApp sebagai detail pesanan.', 'success');
    }

    formatWhatsAppMessage(cartItems, subtotal, name, address) {
        let message = "Halo, saya ingin memesan produk berikut:\n\n";

        message += `*Data Pembeli*\n`;
        message += `Nama: ${name}\n`;
        message += `Alamat: ${address}\n\n`;

        message += `*Detail Pesanan*\n`;
        cartItems.forEach((item, index) => {
            message += `${index + 1}. ${item.name}\n`;
            message += `   Jumlah: ${item.quantity}\n`;
            message += `   Harga: ${formatRupiah(item.price)}\n`;
            message += `   Subtotal: ${formatRupiah(item.totalPrice)}\n\n`;
        });

        message += `Total: ${formatRupiah(subtotal)}\n\n`;
        message += "Silakan konfirmasi ketersediaan dan cara pembayaran. Terima kasih!";

        return message;
    }

    setPhoneNumber(number) {
        this.phoneNumber = number;
    }

    getPhoneNumber() {
        return this.phoneNumber;
    }
}

// Initialize WhatsApp manager
const whatsappManager = new WhatsAppManager();
window.WhatsAppManager = whatsappManager;