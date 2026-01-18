// orders.js - Manajemen pesanan
class OrderManager {
    constructor() {
        this.orders = [];
    }

    async getAllOrders() {
        try {
            const token = getFromLocalStorage('fashionacc_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) throw new Error('Failed to fetch orders');

            this.orders = await response.json();
            return this.orders;
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }
    async getOrderById(id) {
        try {
            const token = getFromLocalStorage('fashionacc_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
                method: 'GET',
                headers: headers
            });

            if (!response.ok) throw new Error('Failed to fetch order details');

            const order = await response.json();
            return order;
        } catch (error) {
            console.error(`Error fetching order ${id}:`, error);
            return null;
        }
    }

    async updateOrderStatus(id, status) {
        try {
            const token = getFromLocalStorage('fashionacc_token');
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const response = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
                method: 'PATCH',
                headers: headers,
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Failed to update order status');

            return await response.json();
        } catch (error) {
            console.error(`Error updating order ${id} status:`, error);
            return null;
        }
    }

    async createOrder(orderData) {
        try {
            // Note: Public endpoint usually doesn't need token, but if it does, add it.
            // Documentation says Public / Accessible to public.
            const headers = { 'Content-Type': 'application/json' };

            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(orderData)
            });

            if (!response.ok) throw new Error('Failed to create order');

            return await response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            return null;
        }
    }
}

const orderManager = new OrderManager();
window.OrderManager = orderManager;
