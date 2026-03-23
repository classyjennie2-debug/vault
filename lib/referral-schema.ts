import { run, get } from '@/lib/db'

/**
 * Ensure referral tables exist in the database
 * Called automatically to initialize schema if missing
 */
export async function ensureReferralTablesExist() {
  try {
    // Check if referral_codes table exists
    const tableExists = await get(
      `SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'referral_codes'
       ) as exists`
    )

    if (tableExists && (tableExists as any).exists) {
      // Table already exists, all good
      return true
    }

    console.log('[REFERRAL] Creating referral tables in database...')

    // Create referral_codes table
    await run(`
      CREATE TABLE IF NOT EXISTS referral_codes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code VARCHAR(20) UNIQUE NOT NULL,
        referral_link VARCHAR(500),
        clicks_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes for referral_codes
    await run(`CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_referral_codes_is_active ON referral_codes(is_active)`)

    // Create referrals table
    await run(`
      CREATE TABLE IF NOT EXISTS referrals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referral_code_id UUID REFERENCES referral_codes(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'active',
        signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (referred_user_id)
      )
    `)

    // Create indexes for referrals
    await run(`CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status)`)

    // Create referral_bonuses table
    await run(`
      CREATE TABLE IF NOT EXISTS referral_bonuses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
        bonus_amount NUMERIC(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        credited_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes for referral_bonuses
    await run(`CREATE INDEX IF NOT EXISTS idx_referral_bonuses_referrer_id ON referral_bonuses(referrer_id)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_referral_bonuses_status ON referral_bonuses(status)`)

    // Create referral_balance table
    await run(`
      CREATE TABLE IF NOT EXISTS referral_balance (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        balance NUMERIC(15,2) DEFAULT 0,
        total_earned NUMERIC(15,2) DEFAULT 0,
        total_withdrawn NUMERIC(15,2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create indexes for referral_balance
    await run(`CREATE INDEX IF NOT EXISTS idx_referral_balance_user_id ON referral_balance(user_id)`)

    // Create referral_withdrawals table
    await run(`
      CREATE TABLE IF NOT EXISTS referral_withdrawals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `)

    // Create indexes for referral_withdrawals
    await run(`CREATE INDEX IF NOT EXISTS idx_referral_withdrawals_user_id ON referral_withdrawals(user_id)`)
    await run(`CREATE INDEX IF NOT EXISTS idx_referral_withdrawals_status ON referral_withdrawals(status)`)

    console.log('[REFERRAL] Successfully created all referral tables')
    return true
  } catch (error) {
    console.error('[REFERRAL] Error ensuring referral tables exist:', error)
    // Don't throw - silently fail so the app continues to work
    return false
  }
}
