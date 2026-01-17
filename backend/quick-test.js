const http = require('http');

function testAPI(method, path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body || '{}') }));
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

(async () => {
  try {
    console.log('1) Testing registration...');
    const reg = await testAPI('POST', '/api/auth/register', { name: 'NewUser', email: 'newuser@test.com', password: 'pass123' });
    console.log('Status:', reg.status, 'Response:', reg.body);

    console.log('\n2) Testing login...');
    const login = await testAPI('POST', '/api/auth/login', { email: 'newuser@test.com', password: 'pass123' });
    console.log('Status:', login.status, 'Response:', login.body);

    console.log('\n3) Testing admin login...');
    const adminLogin = await testAPI('POST', '/api/auth/login', { email: 'admin@example.com', password: 'admin123' });
    console.log('Status:', adminLogin.status, 'Response:', adminLogin.body);

  } catch (err) {
    console.error('Test error:', err.message);
  }
})();
