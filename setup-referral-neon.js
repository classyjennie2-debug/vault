// Run this to create all referral tables in Neon with correct types
const { Pool } = require('pg')

// Use the connection string provided
const connectionString = 'postgresql://neondb_owner:npg_Q3iRvHCY7SMK@ep-ancient-feather-adqvcohj-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

async function createReferralTables() {
  const pool = new Pool({ connectionString })
  
  console.log('🔧 Creating referral tables in Neon...\n')
  
  try {
    // Step 1: Enable UUID extension
    console.log('📦 Step 1: Enabling UUID extension...')
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)
    console.log('✓ UUID extension enabled\n')
    
    // Step 2: Create referral_codes table
    console.log('📋 Step 2: Creating referral_codes table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_codes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code VARCHAR(20) UNIQUE NOT NULL,
        referral_link VARCHAR(500),
        clicks_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✓ referral_codes table created')
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_referral_codes_is_active ON referral_codes(is_active)`)
    console.log('✓ Indexes created\n')
    
    // Step 3: Create referrals table
    console.log('📋 Step 3: Creating referrals table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        referrer_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referred_user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referral_code_id UUID REFERENCES referral_codes(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'active',
        signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (referred_user_id)
      )
    `)
    console.log('✓ referrals table created')
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status)`)
    console.log('✓ Indexes created\n')
    
    // Step 4: Create referral_bonuses table
    console.log('📋 Step 4: Creating referral_bonuses table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_bonuses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        referrer_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
        bonus_amount NUMERIC(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        credited_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✓ referral_bonuses table created')
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_referral_bonuses_referrer_id ON referral_bonuses(referrer_id)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_referral_bonuses_status ON referral_bonuses(status)`)
    console.log('✓ Indexes created\n')
    
    // Step 5: Create referral_balance table
    console.log('📋 Step 5: Creating referral_balance table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_balance (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        balance NUMERIC(15,2) DEFAULT 0,
        total_earned NUMERIC(15,2) DEFAULT 0,
        total_withdrawn NUMERIC(15,2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✓ referral_balance table created')
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_referral_balance_user_id ON referral_balance(user_id)`)
    console.log('✓ Indexes created\n')
    
    // Step 6: Create referral_withdrawals table
    console.log('📋 Step 6: Creating referral_withdrawals table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_withdrawals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `)
    console.log('✓ referral_withdrawals table created')
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_referral_withdrawals_user_id ON referral_withdrawals(user_id)`)
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_referral_withdrawals_status ON referral_withdrawals(status)`)
    console.log('✓ Indexes created\n')
    
    // Step 7: Verify all tables exist
    console.log('✅ Step 7: Verifying tables...')
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'referral%'
      ORDER BY table_name
    `)
    
    console.log('\n📊 Tables created successfully:\n')
    result.rows.forEach((row, i) => {
      console.log(`  ${i + 1}. ${row.table_name}`)
    })
    
    console.log('\n✨ All referral tables are ready!\n')
    console.log('🎉 Your referral system is now fully set up and should work!')
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('Details:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

createReferralTables()
