// Shared app utilities for OrganicFruits
const API_URL = '/api';
let _productCache = null;

function getToken() { return localStorage.getItem('token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch (e) { return null; }
}
function isAdmin() { const u = getUser(); return u && u.role === 'admin'; }

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

async function getProducts(forceRefresh = false) {
  if (_productCache && !forceRefresh) return _productCache;
  try {
    const res = await fetch(`${API_URL}/products`);
    if (res.ok) {
      _productCache = await res.json();
      return _productCache;
    }
    return [];
  } catch (e) { return []; }
}

function addToCart(product, quantity = 1) {
  if (!product || !product.id) {
    console.error('Invalid product');
    return false;
  }

  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existing = cart.find(i => i.id === product.id);

  if (existing) {
    existing.quantity = (Number(existing.quantity) || 0) + Number(quantity);
  } else {
    cart.push({ ...product, quantity: Number(quantity) });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();

  // Background sync if logged in
  const token = getToken();
  if (token) {
    fetch(`${API_URL}/cart/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ items: cart })
    }).catch(e => console.warn('Cart sync failed:', e));
  }

  return true;
}

async function login(credentials) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Login failed');
  }
  const data = await res.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

async function register(userData) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Registration failed');
  }
  const data = await res.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

// UI Helpers
function updateNav() {
  const user = getUser();
  const authButtons = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');
  const userName = document.getElementById('user-name');

  if (user && authButtons && userMenu) {
    authButtons.classList.add('hidden');
    userMenu.classList.remove('hidden');
    if (userName) userName.textContent = user.name;

    // Add logout to dropdown if it exists
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown && dropdown.innerHTML.trim() === '') {
      dropdown.innerHTML = `
        <a href="orders.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</a>
        <a href="notes.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Notes</a>
        ${user.role === 'admin' ? '<a href="admin_dashboard_modern.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-bold text-green-600">Admin Panel</a>' : ''}
        <hr class="my-1">
        <button onclick="logout()" class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
      `;
    }
  }
}

function updateCartCount() {
  const countEl = document.getElementById('cart-count');
  if (!countEl) return;
  try {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    countEl.textContent = count;
  } catch (e) { countEl.textContent = '0'; }
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
}

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
  updateNav();
  updateCartCount();
});

// getCurrentUser - alias for getUser for backward compatibility
function getCurrentUser() {
  return getUser();
}

// Export to window
window.getToken = getToken;
window.getUser = getUser;
window.getCurrentUser = getCurrentUser;
window.isAdmin = isAdmin;
window.logout = logout;
window.getProducts = getProducts;
window.addToCart = addToCart;
window.login = login;
window.register = register;
window.toggleUserDropdown = toggleUserDropdown;
window.updateNav = updateNav;
window.updateCartCount = updateCartCount;
