require('dotenv').config({path:'.env.vercel'});
const {Pool} = require('pg');
const bcrypt = require('bcrypt');

(async function() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const email = 'alex@example.com';
    const res = await pool.query('SELECT id,name,email,passwordhash,verified FROM users WHERE email = $1', [email]);
    console.log('db rows:', res.rows);
    if (res.rows.length) {
      const ok = await bcrypt.compare('password123', res.rows[0].passwordhash);
      console.log('password matches?', ok);
    }
  } catch (err) {
    console.error('query error', err);
  } finally {
    await pool.end();
  }
})();