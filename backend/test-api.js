const fetch = global.fetch || require('node-fetch');

const API = 'http://127.0.0.1:5000/api';

async function run() {
  try {
    console.log('1) Registering test user...');
    let res = await fetch(`${API}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'QA Tester', email: 'qa+tst@example.com', password: 'testpass' })
    });
    console.log('Register status:', res.status);
    const reg = await res.json().catch(()=>({}));
    console.log('Register response:', reg);

    console.log('2) Logging in...');
    res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'qa+tst@example.com', password: 'testpass' }) });
    console.log('Login status:', res.status);
    const login = await res.json();
    console.log('Login response:', login);
    const token = login.token;
    if (!token) {
      console.error('Login failed, aborting tests');
      return;
    }

    console.log('3) Creating a list...');
    res = await fetch(`${API}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token }, body: JSON.stringify({ title: 'Weekly Groceries', items: ['Apples','Bananas','Milk'] }) });
    console.log('Create list status:', res.status);
    console.log('Create list response:', await res.json());

    console.log('4) Sending message to admin...');
    res = await fetch(`${API}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer '+token }, body: JSON.stringify({ subject: 'Test message', message: 'Hello admin, this is a test.' }) });
    console.log('Send message status:', res.status);
    console.log('Send message response:', await res.json().catch(()=>({}))); 

    console.log('5) Fetching lists...');
    res = await fetch(`${API}/notes`, { headers: { 'Authorization': 'Bearer '+token } });
    console.log('Fetch lists status:', res.status);
    console.log('Lists:', await res.json());

    console.log('6) Logging in as admin to fetch messages...');
    res = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'admin@organicfruits.com', password: 'admin123' }) });
    const adminLogin = await res.json();
    const adminToken = adminLogin.token;
    res = await fetch(`${API}/messages`, { headers: { 'Authorization': 'Bearer '+adminToken } });
    console.log('Admin messages status:', res.status);
    console.log('Messages:', await res.json());

  } catch (err) {
    console.error('Test script error:', err);
  }
}

run();
