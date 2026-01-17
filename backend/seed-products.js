// Use built-in fetch in Node 18+
const API_BASE = 'http://localhost:5000/api';

async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...\n');
    
    // Wait for backend to be ready
    console.log('⏳ Waiting for backend to connect...');
    let retries = 0;
    while (retries < 5) {
      try {
        const healthRes = await fetch(`${API_BASE}/health`);
        if (healthRes.ok) {
          console.log('   ✅ Backend is ready\n');
          break;
        }
      } catch (err) {
        retries++;
        if (retries < 5) {
          console.log(`   Attempt ${retries}/5... retrying in 2s`);
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }

    if (retries >= 5) {
      throw new Error('Backend not responding. Ensure it is running on http://localhost:5000');
    }

    // 1. Register/login admin user
    console.log('1️⃣ Registering admin user...');
    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Admin User',
        email: 'admin@organicfruits.com',
        password: 'AdminPass123!',
        isAdmin: true
      })
    });

    const registerData = await registerRes.json();
    if (!registerRes.ok && !registerData.token) {
      // Try login if already registered
      console.log('   User may exist. Attempting login...');
      const loginRes = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@organicfruits.com',
          password: 'AdminPass123!'
        })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        throw new Error('Login failed: ' + (loginData.error || 'Unknown error'));
      }
      registerData.token = loginData.token;
    }

    const token = registerData.token;
    console.log(`   ✅ Admin authenticated: ${registerData.user?.email}\n`);

    // 2. Seed products
    console.log('2️⃣ Seeding products...');
    const seedRes = await fetch(`${API_BASE}/products/seed/initial`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const seedData = await seedRes.json();
    if (!seedRes.ok) {
      throw new Error(seedData.error || 'Seed failed');
    }

    console.log(`   ✅ ${seedData.count || seedData.message} products seeded\n`);

    // 3. Verify products
    console.log('3️⃣ Verifying products...');
    const productsRes = await fetch(`${API_BASE}/products`);
    const products = await productsRes.json();
    console.log(`   ✅ ${products.length} products in database\n`);

    // 4. Show featured products
    console.log('4️⃣ Featured products:');
    const featured = products.filter(p => p.featured);
    featured.forEach(p => {
      console.log(`   • ${p.title} (${p.category}) - $${p.price}`);
    });

    console.log('\n✨ Seeding complete! Visit http://localhost:8000/shop.html to see products.\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedProducts();
