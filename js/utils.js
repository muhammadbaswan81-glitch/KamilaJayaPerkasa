// utils.js - Fungsi utilitas yang digunakan di seluruh aplikasi

// Format angka ke Rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Tampilkan notifikasi
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Validasi form
function validateForm(formData) {
    const errors = [];

    if (!formData.name || formData.name.trim() === '') {
        errors.push('Nama produk harus diisi');
    }

    if (!formData.category || formData.category === '') {
        errors.push('Kategori harus dipilih');
    }

    if (!formData.price || formData.price <= 0) {
        errors.push('Harga harus lebih dari 0');
    }

    if (!formData.desc || formData.desc.trim() === '') {
        errors.push('Deskripsi harus diisi');
    }

    return errors;
}

// Generate ID unik
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Handle image upload
function handleImageUpload(file, callback) {
    if (!file) {
        callback(null, 'Tidak ada file yang dipilih');
        return;
    }

    // Validasi tipe file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        callback(null, 'Format file tidak didukung. Gunakan JPG, PNG, atau GIF');
        return;
    }

    // Validasi ukuran file (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
        callback(null, 'Ukuran file terlalu besar. Maksimal 2MB');
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        callback(e.target.result, null);
    };

    reader.onerror = function () {
        callback(null, 'Gagal membaca file');
    };

    reader.readAsDataURL(file);
}

// Debounce function untuk search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Simpan ke localStorage
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

// Ambil dari localStorage
function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error getting from localStorage:', error);
        return null;
    }
}

// Hapus dari localStorage
function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Error removing from localStorage:', error);
        return false;
    }
}

// Cek apakah user online
function isOnline() {
    return navigator.onLine;
}

// Format tanggal
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Export fungsi
window.AppUtils = {
    formatRupiah,
    showNotification,
    validateForm,
    generateId,
    handleImageUpload,
    debounce,
    saveToLocalStorage,
    getFromLocalStorage,
    removeFromLocalStorage,
    isOnline,
    formatDate
};