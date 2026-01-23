const fetch = global.fetch || require('node-fetch');
const crypto = require('crypto');

const API = 'http://127.0.0.1:5000/api';
const randomStr = () => crypto.randomBytes(4).toString('hex');

async function run() {
    console.log('--- STARTING COMPREHENSIVE API TEST ---');
    try {
        // 1. Register User
        const userEmail = `user_${randomStr()}@test.com`;
        console.log(`\n1) Registering User: ${userEmail}`);
        let res = await fetch(`${API}/auth/register`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email: userEmail, password: 'password123' })
        });
        let data = await res.json();
        console.log(`   Status: ${res.status}`, res.ok ? '✅' : '❌');
        if (!res.ok) throw new Error(data.error);
        const userToken = data.token;

        // 2. Login Admin
        console.log('\n2) Logging in Admin...');
        res = await fetch(`${API}/auth/login`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@organicfruits.com', password: 'admin123' })
        });
        data = await res.json();
        console.log(`   Status: ${res.status}`, res.ok ? '✅' : '❌');
        if (!res.ok) throw new Error(data.error);
        const adminToken = data.token;

        // 3. Create Product (Admin)
        console.log('\n3) Creating Product (Admin)...');
        const newProduct = {
            name: `Test Fruit ${randomStr()}`,
            category: 'fruits',
            price: 5.99,
            stock: 50,
            image: 'https://example.com/fruit.jpg',
            description: 'A test fruit'
        };
        res = await fetch(`${API}/products`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify(newProduct)
        });
        data = await res.json();
        console.log(`   Status: ${res.status}`, res.ok ? '✅' : '❌');
        const productId = data.id || data._id;
        console.log(`   Product ID: ${productId}`);

        // 4. Update Product (Admin) - NEW FEATURE
        console.log('\n4) Updating Product (Admin)...');
        const updateData = { price: 6.99, stock: 45 };
        res = await fetch(`${API}/products/${productId}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
            body: JSON.stringify(updateData)
        });
        data = await res.json();
        console.log(`   Status: ${res.status}`, res.ok ? '✅' : '❌');
        if (data.price !== 6.99) console.error('   ❌ Price update failed!');

        // 5. Add to Cart (User)
        console.log('\n5) Updating Cart (User)...');
        const cartItem = { ...data, quantity: 2 }; // data is the updated product
        res = await fetch(`${API}/cart/update`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
            body: JSON.stringify({ items: [cartItem], total: 13.98 })
        });
        console.log(`   Status: ${res.status}`, res.ok ? '✅' : '❌');

        // 6. Place Order (User)
        console.log('\n6) Placing Order (User)...');
        const orderData = {
            items: [cartItem],
            total: 13.98,
            customerName: 'Test User',
            phone: '1234567890',
            address: '123 Test St',
            paymentMethod: 'cod'
        };
        res = await fetch(`${API}/orders`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
            body: JSON.stringify(orderData)
        });
        data = await res.json();
        console.log(`   Status: ${res.status}`, res.ok ? '✅' : '❌');
        const orderId = data.id || data._id;

        // 7. View Orders (Admin)
        console.log('\n7) Viewing Orders (Admin)...');
        res = await fetch(`${API}/orders`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        data = await res.json();
        console.log(`   Status: ${res.status}`, res.ok ? '✅' : '❌');
        const foundOrder = data.find(o => (o.id || o._id) === orderId);
        if (foundOrder) console.log('   ✅ Order found in admin list');
        else console.error('   ❌ Order NOT found in admin list');

        // 8. Delete Product (Admin)
        console.log('\n8) Deleting Product (Admin)...');
        res = await fetch(`${API}/products/${productId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        console.log(`   Status: ${res.status}`, res.ok ? '✅' : '❌');

        console.log('\n--- TEST COMPLETE ---');

    } catch (err) {
        console.error('\n❌ TEST FAILED:', err);
    }
}

run();
