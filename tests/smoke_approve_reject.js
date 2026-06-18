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
    const studentUser = `student_a_${rand}`;
    const studentPass = 'studentpass1';

    console.log('1) Registering student:', studentUser);
    await post('/register', {
      full_name: 'Student A',
      email: `${studentUser}@example.com`,
      username: studentUser,
      password: studentPass,
      registration_number: `REG${rand}`,
      phone: '0712345678'
    });

    console.log('2) Logging in student');
    await get('/login');
    await post('/login', { username: studentUser, password: studentPass });

    console.log('3) Creating report as student');
    const insertRes = await post('/_test/insert-report', { title: 'ApproveTest Item', description: 'For approval test', location: 'Gate' });
    if (!insertRes.data || !insertRes.data.id) {
      console.error('Failed to create report', insertRes.status, insertRes.data);
      process.exit(2);
    }
    const reportId = insertRes.data.id;
    console.log('  report id', reportId);

    console.log('4) Student submits claim');
    await post(`/student/claim/${reportId}`);

    console.log('5) Fetching claim id for report');
    console.log('   cookie before fetching claims:', cookie);
    const claimsRes = await get(`/ _test/claims-by-report/${reportId}`.replace(' ', ''));
    console.log('   cookie after fetching claims attempt:', cookie);
    if (claimsRes.status !== 200 || !Array.isArray(claimsRes.data) || claimsRes.data.length === 0) {
      console.error('Failed to fetch claims', claimsRes.status, claimsRes.data);
      process.exit(3);
    }
    const claimId = claimsRes.data[0].id;
    console.log('  claim id', claimId);

    console.log('6) Logout student');
    await get('/logout');
    cookie = '';

    console.log('7) Login as security');
    await get('/login');
    await post('/login', { username: 'security', password: 'security@24' });

    console.log('8) Approve claim as security');
    const approveRes = await post(`/security/claim/${claimId}/approve`);
    console.log('  approve status', approveRes.status);

    console.log('9) Logout security');
    await get('/logout');

    console.log('Approve/reject smoke test completed.');
    process.exit(0);
  } catch (err) {
    console.error('Smoke approve test error', err && err.response ? err.response.status : err.message, err && err.response ? err.response.data : '');
    process.exit(1);
  }
})();
