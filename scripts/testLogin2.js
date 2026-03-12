require('dotenv').config({path:'.env.vercel'});
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const email = 'alex@example.com';
  const password = 'password123';
  try {
    const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('row count', res.rowCount);
    if (res.rows.length) {
      console.log('user row', res.rows[0]);
      const valid = await bcrypt.compare(password, res.rows[0].passwordhash);
      console.log('password valid?', valid);
    }
  } catch (e) {
    console.error('query error', e);
  } finally {
    await pool.end();
  }
})();