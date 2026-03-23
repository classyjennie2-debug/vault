#!/usr/bin/env node

/**
 * Ensure Referral Tables Exist
 * 
 * This script creates the referral tables if they don't exist in the database.
 * Run this when deploying to production to ensure the referral system works.
 * 
 * Usage: npx ts-node scripts/ensure-referral-tables.ts
 */

import { Pool } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable not set')
  process.exit(1)
}

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL, max: 1 })
  
  try {
    console.log('🔧 Ensuring referral tables exist in database...\n')
    
    // Create referral_codes table
    console.log('📋 Creating referral_codes table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_codes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code VARCHAR(20) UNIQUE NOT NULL,
        referral_link VARCHAR(500),
        clicks_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_code (code),
        INDEX idx_is_active (is_active),
        INDEX idx_created_at (created_at)
      )
    `)
    console.log('✓ referral_codes table ready')
    
    // Create referrals table
    console.log('📋 Creating referrals table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referral_code_id UUID REFERENCES referral_codes(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'active',
        signup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE (referred_user_id),
        INDEX idx_referrer_id (referrer_id),
        INDEX idx_referred_user_id (referred_user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `)
    console.log('✓ referrals table ready')
    
    // Create referral_bonuses table
    console.log('📋 Creating referral_bonuses table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_bonuses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
        bonus_amount NUMERIC(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        credited_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_referrer_id (referrer_id),
        INDEX idx_referral_id (referral_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at)
      )
    `)
    console.log('✓ referral_bonuses table ready')
    
    // Create referral_balance table
    console.log('📋 Creating referral_balance table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_balance (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        balance NUMERIC(15,2) DEFAULT 0,
        total_earned NUMERIC(15,2) DEFAULT 0,
        total_withdrawn NUMERIC(15,2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id)
      )
    `)
    console.log('✓ referral_balance table ready')
    
    // Create referral_withdrawals table
    console.log('📋 Creating referral_withdrawals table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referral_withdrawals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC(15,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (requested_at)
      )
    `)
    console.log('✓ referral_withdrawals table ready')
    
    console.log('\n✅ All referral tables successfully created or verified!\n')
    
  } catch (error) {
    console.error('❌ Error initializing referral tables:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()
