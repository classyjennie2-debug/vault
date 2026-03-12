// use the global fetch API available in modern Node

(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@example.com', password: 'password123' }),
    });
    console.log('login status', res.status);
    const body = await res.text();
    console.log('login body', body);
    const cookie = res.headers.get('set-cookie');
    console.log('cookie header', cookie);
    if (cookie) {
      const r2 = await fetch('http://localhost:3000/dashboard/investments', { headers: { cookie } });
      console.log('investments status', r2.status);
      const text = await r2.text();
      console.log('investments snippet', text.slice(0, 500));
    }
  } catch (e) {
    console.error('error', e);
  }
})();
