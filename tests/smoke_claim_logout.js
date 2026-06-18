const axios = require('axios');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

let cookie = '';
function storeCookies(res) {
  const set = res.headers['set-cookie'];
  if (set) {
    cookie = set.map((c) => c.split(';')[0]).join('; ');
  }
}

async function post(path, data) {
  const body = new URLSearchParams(data || {}).toString();
  const res = await axios.post(BASE + path, body, { maxRedirects: 0, validateStatus: null, headers: { Cookie: cookie, 'Content-Type': 'application/x-www-form-urlencoded' } });
  storeCookies(res);
  return res;
}

async function get(path) {
  const res = await axios.get(BASE + path, { maxRedirects: 0, validateStatus: null, headers: { Cookie: cookie } });
  storeCookies(res);
  return res;
}

(async () => {
  try {
    const rand = Date.now();
    const username = `testuser_${rand}`;
    const password = 'testpass123';

    console.log('1) Registering test user:', username);
    await post('/register', {
      full_name: 'Test User',
      email: `${username}@example.com`,
      username,
      password,
      registration_number: `REG${rand}`,
      phone: '0712345678'
    });

    console.log('2) Logging in');
    // Ensure we have any initial cookies from the login page
    await get('/login');
    const loginRes = await post('/login', { username, password });
    console.log('   cookie after login:', cookie);
    // give the session store a moment to persist
    await new Promise((r) => setTimeout(r, 300));
    if (![302, 200].includes(loginRes.status)) {
      console.error('Login failed', loginRes.status, loginRes.data);
      process.exit(2);
    }

    console.log('3) Creating a claimable report via test helper');
    const insertRes = await post('/_test/insert-report', { title: 'Smoke Test Item', description: 'Auto-created', location: 'Test Gate' });
    if (insertRes.status !== 200 || !insertRes.data.id) {
      console.error('Failed to create report', insertRes.status, insertRes.data);
      process.exit(3);
    }
    const reportId = insertRes.data.id;
    console.log('  created report id', reportId);

    console.log('4) Submitting claim for report');
    const claimRes = await post(`/student/claim/${reportId}`);
    if (![302,200].includes(claimRes.status)) {
      console.error('Claim request failed', claimRes.status, claimRes.data);
      process.exit(4);
    }

    console.log('5) Logging out (this previously caused the gateway error)');
    const logoutRes = await get('/logout');
    console.log('  logout status', logoutRes.status);

    console.log('Smoke flow completed — check for unexpected errors above.');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test error', err && err.response ? err.response.status : err.message, err && err.response ? err.response.data : '');
    process.exit(1);
  }
})();
