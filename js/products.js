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

    async loadProducts() {
        try {
            const response = await fetch('http://localhost:5000/api/products');
            if (!response.ok) throw new Error('Network response was not ok');

            const apiProducts = await response.json();

            // Map API data (database columns) to frontend structure if necessary
            // Database has 'description', frontend uses 'desc'
            this.products = apiProducts.map(p => ({
                ...p,
                desc: p.description || p.desc,
                // Ensure numbers are numbers
                id: parseInt(p.id),
                price: parseFloat(p.price),
                stock: parseInt(p.stock)
            }));

            // Update currentProductId to appropriate high number based on IDs
            if (this.products.length > 0) {
                const maxId = Math.max(...this.products.map(p => p.id));
                this.currentProductId = maxId + 1;
            }

            this.saveProducts(); // Sync to local storage for redundancy
            console.log('Products loaded from API:', this.products.length);
        } catch (error) {
            console.error('Failed to load from API, falling back to local storage:', error);

            // Fallback logic
            const savedProducts = getFromLocalStorage('fashionacc_products');

            if (savedProducts && savedProducts.length > 0) {
                this.products = savedProducts;
                const maxId = Math.max(...this.products.map(p => p.id));
                this.currentProductId = maxId + 1;
            } else {
                this.products = this.getInitialProducts();
                this.saveProducts();
            }
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

    async getProductById(id) {
        try {
            // Check local cache first for immediate feedback (optional, but good for UX)
            // let product = this.products.find(p => p.id === id);

            // Fetch fresh data from API
            const response = await fetch(`http://localhost:5000/api/products/${id}`);
            if (!response.ok) throw new Error('Product not found in API');

            const apiProduct = await response.json();

            // Map API data
            const product = {
                ...apiProduct,
                desc: apiProduct.description || apiProduct.desc || '',
                id: parseInt(apiProduct.id),
                price: parseFloat(apiProduct.price),
                stock: parseInt(apiProduct.stock)
            };

            // Update local cache
            const index = this.products.findIndex(p => p.id === product.id);
            if (index !== -1) {
                this.products[index] = product;
            } else {
                this.products.push(product);
            }
            this.saveProducts();

            return product;
        } catch (error) {
            console.warn(`Failed to fetch product ${id} from API, using local cache. Error:`, error);
            // Fallback to local cache
            return this.products.find(p => p.id === id);
        }
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

    async addProduct(productData) {
        try {
            const token = getFromLocalStorage('fashionacc_token');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:5000/api/products', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    name: productData.name,
                    category: productData.category,
                    price: productData.price,
                    stock: productData.stock,
                    image: productData.image,
                    description: productData.desc // Map frontend 'desc' to backend 'description'
                })
            });

            if (!response.ok) throw new Error('Failed to create product');

            const newApiProduct = await response.json();

            // Map back to frontend structure
            const newProduct = {
                ...newApiProduct,
                desc: newApiProduct.description || newApiProduct.desc,
                id: parseInt(newApiProduct.id),
                price: parseFloat(newApiProduct.price),
                stock: parseInt(newApiProduct.stock)
            };

            this.products.push(newProduct);
            this.saveProducts();
            return newProduct;
        } catch (error) {
            console.error('Error adding product:', error);
            // Optional: fallback to local only if offline? 
            // For "core system" usually we want to enforce server sync.
            // Returning null or throwing error to let UI know.
            return null;
        }
    }

    async updateProduct(id, productData) {
        try {
            const token = getFromLocalStorage('fashionacc_token');
            const headers = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify({
                    name: productData.name,
                    category: productData.category,
                    price: productData.price,
                    stock: productData.stock,
                    image: productData.image,
                    description: productData.desc // Map frontend 'desc' to backend 'description'
                })
            });

            if (!response.ok) throw new Error('Failed to update product');

            const updatedApiProduct = await response.json();

            const index = this.products.findIndex(product => product.id === id);

            if (index !== -1) {
                // Map back to frontend structure
                this.products[index] = {
                    ...updatedApiProduct,
                    desc: updatedApiProduct.description || updatedApiProduct.desc,
                    id: parseInt(updatedApiProduct.id),
                    price: parseFloat(updatedApiProduct.price),
                    stock: parseInt(updatedApiProduct.stock),
                    updatedAt: new Date().toISOString()
                };

                this.saveProducts();
                return this.products[index];
            }
            return null;
        } catch (error) {
            console.error('Error updating product:', error);
            return null;
        }
    }

    async reduceStock(id, quantity) {
        const index = this.products.findIndex(product => product.id === id);

        if (index !== -1) {
            const product = this.products[index];
            const currentStock = product.stock || 0;
            const newStock = Math.max(0, currentStock - quantity);

            // Update via API
            // Reusing updateProduct logic which handles token and headers
            // We need to pass all product fields to updateProduct as PUT usually replaces
            const productData = {
                name: product.name,
                category: product.category,
                price: product.price,
                stock: newStock, // The changed field
                image: product.image,
                desc: product.desc
            };

            const updatedProduct = await this.updateProduct(id, productData);

            if (updatedProduct) {
                console.log(`Stock reduced for ${id}. New stock: ${newStock}`);
                return updatedProduct;
            }
        }
        return null;
    }

    async deleteProduct(id) {
        try {
            const token = getFromLocalStorage('fashionacc_token');
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'DELETE',
                headers: headers
            });

            if (!response.ok) throw new Error('Failed to delete product');

            const index = this.products.findIndex(product => product.id === id);

            if (index !== -1) {
                const deletedProduct = this.products.splice(index, 1)[0];
                this.saveProducts();
                return deletedProduct;
            }
            return null;
        } catch (error) {
            console.error('Error deleting product:', error);
            return null;
        }
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