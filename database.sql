-- Database Schema untuk Kamila Jaya Perkasa
-- Type: MariaDB / MySQL
-- Cocok untuk XAMPP / PHPMyAdmin

-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS `kamila_jaya_perkasa`;
USE `kamila_jaya_perkasa`;

-- 2. Tabel Users (untuk Login Owner)
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL, -- Di produksi sebaiknya gunakan hash (e.g. Bcrypt)
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Products (Sesuai fields di js/products.js)
CREATE TABLE IF NOT EXISTS `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `price` DECIMAL(15, 2) NOT NULL,
    `stock` INT NOT NULL DEFAULT 0,
    `image` TEXT, -- URL gambar
    `description` TEXT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Tabel Orders (Untuk menyimpan history penjualan & Dashboard Stats)
CREATE TABLE IF NOT EXISTS `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `customer_name` VARCHAR(100),
    `customer_address` TEXT,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending', -- Status pesanan
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Order Items (Detail barang per order)
CREATE TABLE IF NOT EXISTS `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `product_id` INT, -- Ubah ke NULL agar ON DELETE SET NULL berfungsi
    `quantity` INT NOT NULL,
    `price` DECIMAL(15, 2) NOT NULL, -- Harga saat beli (snapshot)
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL
);

-- ==========================================
-- DUMMY DATA INSERTION
-- ==========================================

-- Data Dummy User (Login Owner)
-- Username: owner, Password: owner123
INSERT INTO `users` (`username`, `password`) VALUES ('owner', 'owner123');

-- Data Dummy Products (Diambil dari getInitialProducts di js/products.js)
-- ID dimulai dari 201 sesuai frontend
INSERT INTO `products` (`id`, `name`, `category`, `price`, `stock`, `image`, `description`) VALUES
(201, 'Kalung Liontin Rose Gold', 'Perhiasan', 249000, 20, 'https://placehold.co/400x300/e11d48/FFF?text=Kalung+Rose+Gold', 'Kalung titanium anti-karat dengan liontin minimalis yang manis.'),
(202, 'Tas Selempang Mini Quilted', 'Tas', 185000, 20, 'https://placehold.co/400x300/db2777/FFF?text=Tas+Mini', 'Tas kulit sintetis premium dengan motif jahitan wajik yang elegan.'),
(203, 'Anting Mutiara Korea', 'Perhiasan', 45000, 20, 'https://placehold.co/400x300/f472b6/FFF?text=Anting+Mutiara', 'Anting stud dengan aksen mutiara, cocok untuk pesta maupun harian.'),
(204, 'Jam Tangan Strap Kulit', 'Jam Tangan', 320000, 20, 'https://placehold.co/400x300/fbbf24/FFF?text=Jam+Wanita', 'Dial diameter kecil 3cm dengan strap kulit coklat vintage.'),
(205, 'Jepit Rambut Pita Velvet', 'Hair Accessories', 25000, 20, 'https://placehold.co/400x300/be185d/FFF?text=Pita+Velvet', 'Jepit rambut besar (jedai) dengan hiasan pita kain bludru mewah.'),
(206, 'Cincin Stackable Silver', 'Perhiasan', 89000, 20, 'https://placehold.co/400x300/94a3b8/FFF?text=Cincin+Silver', 'Set isi 3 cincin tipis yang bisa dipakai menumpuk atau terpisah.'),
(207, 'Scarf Sutra Motif Floral', 'Syal', 115000, 20, 'https://placehold.co/400x300/a855f7/FFF?text=Scarf+Floral', 'Bahan lembut dan dingin, bisa dijadikan hijab atau aksesoris leher.'),
(208, 'Kacamata Cat Eye Modern', 'Kacamata', 150000, 20, 'https://placehold.co/400x300/111827/FFF?text=Kacamata+CatEye', 'Frame runcing yang memberikan kesan wajah lebih tirus dan stylish.');

-- Data Dummy Order (Contoh untuk Dashboard Stats)
INSERT INTO `orders` (`customer_name`, `customer_address`, `total_amount`, `status`, `created_at`) VALUES 
('Budi Santoso', 'Jl. Merpati No 10, Jakarta', 434000, 'completed', NOW());

INSERT INTO `order_items` (`order_id`, `product_id`, `quantity`, `price`) VALUES 
(1, 201, 1, 249000), -- Kalung
(1, 202, 1, 185000); -- Tas
