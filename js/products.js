// products.js - Manajemen data produk
class ProductManager {
    constructor() {
        this.products = [];
        this.currentProductId = 209; // Starting ID
        this.init();
    }

    init() {
        this.loadProducts();
    }

    loadProducts() {
        // Coba load dari localStorage
        const savedProducts = getFromLocalStorage('fashionacc_products');

        if (savedProducts && savedProducts.length > 0) {
            this.products = savedProducts;
            // Cari ID tertinggi
            const maxId = Math.max(...this.products.map(p => p.id));
            this.currentProductId = maxId + 1;
        } else {
            // Gunakan data awal
            this.products = this.getInitialProducts();
            this.saveProducts();
        }

        return this.products;
    }

    getInitialProducts() {
        return [
            {
                "id": 201,
                "name": "Kalung Liontin Rose Gold",
                "category": "Perhiasan",
                "price": 249000,
                "stock": 20,
                "image": "https://placehold.co/400x300/e11d48/FFF?text=Kalung+Rose+Gold",
                "desc": "Kalung titanium anti-karat dengan liontin minimalis yang manis."
            },
            {
                "id": 202,
                "name": "Tas Selempang Mini Quilted",
                "category": "Tas",
                "price": 185000,
                "stock": 20,
                "image": "https://placehold.co/400x300/db2777/FFF?text=Tas+Mini",
                "desc": "Tas kulit sintetis premium dengan motif jahitan wajik yang elegan."
            },
            {
                "id": 203,
                "name": "Anting Mutiara Korea",
                "category": "Perhiasan",
                "price": 45000,
                "stock": 20,
                "image": "https://placehold.co/400x300/f472b6/FFF?text=Anting+Mutiara",
                "desc": "Anting stud dengan aksen mutiara, cocok untuk pesta maupun harian."
            },
            {
                "id": 204,
                "name": "Jam Tangan Strap Kulit",
                "category": "Jam Tangan",
                "price": 320000,
                "stock": 20,
                "image": "https://placehold.co/400x300/fbbf24/FFF?text=Jam+Wanita",
                "desc": "Dial diameter kecil 3cm dengan strap kulit coklat vintage."
            },
            {
                "id": 205,
                "name": "Jepit Rambut Pita Velvet",
                "category": "Hair Accessories",
                "price": 25000,
                "stock": 20,
                "image": "https://placehold.co/400x300/be185d/FFF?text=Pita+Velvet",
                "desc": "Jepit rambut besar (jedai) dengan hiasan pita kain bludru mewah."
            },
            {
                "id": 206,
                "name": "Cincin Stackable Silver",
                "category": "Perhiasan",
                "price": 89000,
                "stock": 20,
                "image": "https://placehold.co/400x300/94a3b8/FFF?text=Cincin+Silver",
                "desc": "Set isi 3 cincin tipis yang bisa dipakai menumpuk atau terpisah."
            },
            {
                "id": 207,
                "name": "Scarf Sutra Motif Floral",
                "category": "Syal",
                "price": 115000,
                "stock": 20,
                "image": "https://placehold.co/400x300/a855f7/FFF?text=Scarf+Floral",
                "desc": "Bahan lembut dan dingin, bisa dijadikan hijab atau aksesoris leher."
            },
            {
                "id": 208,
                "name": "Kacamata Cat Eye Modern",
                "category": "Kacamata",
                "price": 150000,
                "stock": 20,
                "image": "https://placehold.co/400x300/111827/FFF?text=Kacamata+CatEye",
                "desc": "Frame runcing yang memberikan kesan wajah lebih tirus dan stylish."
            }
        ];
    }

    saveProducts() {
        return saveToLocalStorage('fashionacc_products', this.products);
    }

    getAllProducts() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    getProductsByCategory(category) {
        if (category === 'semua') return this.products;
        return this.products.filter(product => product.category === category);
    }

    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.desc.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }

    addProduct(productData) {
        const newProduct = {
            id: this.currentProductId++,
            ...productData,
            createdAt: new Date().toISOString()
        };

        this.products.push(newProduct);
        this.saveProducts();
        return newProduct;
    }

    updateProduct(id, productData) {
        const index = this.products.findIndex(product => product.id === id);

        if (index !== -1) {
            this.products[index] = {
                ...this.products[index],
                ...productData,
                updatedAt: new Date().toISOString()
            };

            this.saveProducts();
            return this.products[index];
        }

        return null;
    }

    reduceStock(id, quantity) {
        const index = this.products.findIndex(product => product.id === id);

        if (index !== -1) {
            const currentStock = this.products[index].stock || 0;
            const newStock = Math.max(0, currentStock - quantity);

            this.products[index] = {
                ...this.products[index],
                stock: newStock,
                updatedAt: new Date().toISOString()
            };

            this.saveProducts();
            return this.products[index];
        }
        return null;
    }

    deleteProduct(id) {
        const index = this.products.findIndex(product => product.id === id);

        if (index !== -1) {
            const deletedProduct = this.products.splice(index, 1)[0];
            this.saveProducts();
            return deletedProduct;
        }

        return null;
    }

    getCategories() {
        const categories = this.products.map(product => product.category);
        return [...new Set(categories)];
    }

    getFeaturedProducts(limit = 4) {
        return this.products.slice(0, limit);
    }
}

// Initialize product manager
const productManager = new ProductManager();
window.ProductManager = productManager;