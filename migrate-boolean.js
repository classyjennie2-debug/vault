const { Pool } = require('pg')

async function migrate() {
  const dbUrl = process.env.DATABASE_URL
  console.log('DATABASE_URL:', dbUrl ? '✓ Set' : '✗ Not set')
  
  if (!dbUrl) {
    console.error('Error: DATABASE_URL environment variable not set')
    process.exit(1)
  }
  
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  })

  try {
    console.log('Connecting to database...')
    const client = await pool.connect()
    console.log('✓ Connected')
    
    console.log('Converting verification_codes.used to boolean...')
    await client.query('ALTER TABLE verification_codes ALTER COLUMN used TYPE boolean USING (used::boolean)')
    console.log('✓ verification_codes.used converted')
    
    console.log('Converting password_reset_tokens.used to boolean...')
    await client.query('ALTER TABLE password_reset_tokens ALTER COLUMN used TYPE boolean USING (used::boolean)')
    console.log('✓ password_reset_tokens.used converted')
    
    client.release()
    console.log('\n✅ Migration complete!')
  } catch (err) {
    console.error('Migration error:', err.message)
    console.error('Details:', err)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrate()
