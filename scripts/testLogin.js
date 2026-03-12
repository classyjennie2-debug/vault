require('dotenv').config({path:'.env.vercel'});
const { getUserByEmail } = require('../lib/db');
const { verifyPassword } = require('../lib/auth');

(async () => {
  const email = 'alex@example.com';
  const password = 'password123';
  console.log('testing login logic with env vars');
  const user = await getUserByEmail(email);
  console.log('user', user);
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;
  console.log('password valid?', valid);
})();