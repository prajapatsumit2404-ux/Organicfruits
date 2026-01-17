// Shared app utilities for OrganicFruits
const API_URL = '/api';

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

async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    return res.ok ? await res.json() : [];
  } catch (e) { return []; }
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
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
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

// Export to window
window.getToken = getToken;
window.getUser = getUser;
window.isAdmin = isAdmin;
window.logout = logout;
window.login = login;
window.register = register;
window.toggleUserDropdown = toggleUserDropdown;
window.updateNav = updateNav;
window.updateCartCount = updateCartCount;
