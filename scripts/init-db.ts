#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * Usage: npx ts-node scripts/init-db.ts
 * 
 * This script initializes the PostgreSQL database with all required tables,
 * columns, indexes, and seed data.
 */

const MODULE_PATH = process.env.DATABASE_URL ? '../lib/db' : null

if (!MODULE_PATH) {
  console.error('❌ DATABASE_URL environment variable not set')
  process.exit(1)
}

const { pgPool } = require(MODULE_PATH)

async function initDatabase() {
  try {
    console.log('🔧 Initializing database...\n')

    if (!pgPool) {
      console.error('❌ PostgreSQL pool not initialized')
      process.exit(1)
    }

    const operations = []
    const errors = []

    // 1. Add missing user columns
    console.log('📋 Ensuring all user columns exist...')
    const userColumnsToAdd = [
      { name: 'email_verified', type: 'BOOLEAN NOT NULL DEFAULT FALSE' },
      { name: 'two_factor_enabled', type: 'BOOLEAN NOT NULL DEFAULT FALSE' },
      { name: 'two_factor_secret', type: 'VARCHAR(255)' },
      { name: 'backup_codes', type: 'TEXT' },
    ]

    for (const col of userColumnsToAdd) {
      try {
        await pgPool.query(
          `ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`
        )
        operations.push(`✓ Added users.${col.name}`)
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          errors.push(`Failed to add users.${col.name}: ${e.message}`)
        }
      }
    }

    // 2. Add missing transaction columns
    console.log('📋 Ensuring all transaction columns exist...')
    const txColumnsToAdd = [
      { name: 'method', type: 'VARCHAR(50)' },
      { name: 'bank_account', type: 'VARCHAR(255)' },
      { name: 'crypto_address', type: 'VARCHAR(255)' },
    ]

    for (const col of txColumnsToAdd) {
      try {
        await pgPool.query(
          `ALTER TABLE transactions ADD COLUMN ${col.name} ${col.type}`
        )
        operations.push(`✓ Added transactions.${col.name}`)
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          errors.push(`Failed to add transactions.${col.name}: ${e.message}`)
        }
      }
    }

    // 3. Add missing investment plan columns
    console.log('📋 Ensuring all investment plan columns exist...')
    const planColumnsToAdd = [
      { name: 'category', type: 'VARCHAR(100)' },
      { name: 'management_fee', type: 'NUMERIC(5,2) DEFAULT 0' },
      { name: 'performance_fee', type: 'NUMERIC(5,2) DEFAULT 0' },
      { name: 'withdrawal_fee', type: 'NUMERIC(5,2) DEFAULT 0' },
    ]

    for (const col of planColumnsToAdd) {
      try {
        await pgPool.query(
          `ALTER TABLE investment_plans ADD COLUMN ${col.name} ${col.type}`
        )
        operations.push(`✓ Added investment_plans.${col.name}`)
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          errors.push(`Failed to add investment_plans.${col.name}: ${e.message}`)
        }
      }
    }

    // 4. Create indexes
    console.log('📊 Creating database indexes...')
    const indexes = [
      `CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`,
      `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)`,
      `CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status)`,
      `CREATE INDEX IF NOT EXISTS idx_investments_maturity ON investments(maturity_date)`,
      `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)`,
    ]

    for (const indexSql of indexes) {
      try {
        await pgPool.query(indexSql)
        const indexName = indexSql.match(/idx_\w+/)?.[0]
        operations.push(`✓ Created index: ${indexName}`)
      } catch (e: any) {
        if (!e.message?.includes('already exists')) {
          errors.push(`Index creation failed: ${e.message}`)
        }
      }
    }

    // 5. Seed investment plans
    console.log('🎯 Seeding investment plans...')
    const plans = [
      {
        id: 'cbf',
        name: 'Conservative Bond Fund',
        minAmount: 100,
        maxAmount: 50000,
        returnRate: 0,
        duration: 365,
        durationUnit: 'days',
        risk: 'Low',
        description: 'Safe, steady returns. Select 7-365 days. Up to 1000%+ yearly potential.',
        planType: 'Conservative Bond Fund'
      },
      {
        id: 'gp',
        name: 'Growth Portfolio',
        minAmount: 500,
        maxAmount: 100000,
        returnRate: 0,
        duration: 365,
        durationUnit: 'days',
        risk: 'Medium',
        description: 'Balanced growth. Select 7-365 days. Potential 1000%+ annually.',
        planType: 'Growth Portfolio'
      },
      {
        id: 'hyef',
        name: 'High Yield Equity Fund',
        minAmount: 1000,
        maxAmount: 200000,
        returnRate: 0,
        duration: 365,
        durationUnit: 'days',
        risk: 'High',
        description: 'Aggressive equity growth. Select 7-365 days. Maximum compound returns.',
        planType: 'High Yield Equity Fund'
      },
      {
        id: 'ret',
        name: 'Real Estate Trust',
        minAmount: 10000,
        maxAmount: 500000,
        returnRate: 0,
        duration: 365,
        durationUnit: 'days',
        risk: 'Medium-Low',
        description: 'Real estate backed. Select 7-365 days. Stable compound growth potential.',
        planType: 'Real Estate Trust'
      }
    ]

    let planCount = 0
    for (const plan of plans) {
      try {
        await pgPool.query(
          `INSERT INTO investment_plans (id, name, min_amount, max_amount, return_rate, duration, duration_unit, risk, description, plan_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (id) DO UPDATE SET 
             name = $2, description = $9, plan_type = $10`,
          [plan.id, plan.name, plan.minAmount, plan.maxAmount, plan.returnRate,
           plan.duration, plan.durationUnit, plan.risk, plan.description, plan.planType]
        )
        planCount++
      } catch (e: any) {
        errors.push(`Failed to seed plan ${plan.id}: ${e.message}`)
      }
    }
    operations.push(`✓ Seeded ${planCount}/4 investment plans`)

    // 6. Seed admin user
    console.log('👤 Ensuring admin user exists...')
    try {
      const adminExists = await pgPool.query(
        `SELECT id FROM users WHERE email = $1`,
        ['admin@vaultcapital.bond']
      )

      if (adminExists.rows.length === 0) {
        // Generate a simple hash (in production, use proper password hashing)
        const crypto = require('crypto')
        const passwordHash = crypto.createHash('sha256').update('F2nny4jj!').digest('hex')
        const now = new Date().toISOString()

        await pgPool.query(
          `INSERT INTO users (id, name, email, password_hash, role, verified, balance, joined_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          ['admin-user-001', 'Admin User', 'admin@vaultcapital.bond', passwordHash, 'admin', true, 0, now, now, now]
        )
        operations.push('✓ Created admin user (admin@vaultcapital.bond / F2nny4jj!)')
      } else {
        operations.push('✓ Admin user already exists')
      }
    } catch (e: any) {
      errors.push(`Failed to seed admin user: ${e.message}`)
    }

    // 7. Verify database structure
    console.log('✅ Verifying database structure...')
    const tables = ['users', 'transactions', 'investments', 'investment_plans', 'notifications']
    for (const table of tables) {
      try {
        const result = await pgPool.query(
          `SELECT COUNT(*) FROM information_schema.tables WHERE table_name = $1`,
          [table]
        )
        if (result.rows[0]?.count > 0) {
          operations.push(`✓ Table exists: ${table}`)
        } else {
          errors.push(`Missing table: ${table}`)
        }
      } catch (e: any) {
        errors.push(`Failed to verify table ${table}: ${e.message}`)
      }
    }

    // Print results
    console.log('\n' + '='.repeat(60))
    console.log('DATABASE INITIALIZATION RESULTS')
    console.log('='.repeat(60))

    if (operations.length > 0) {
      console.log('\n✓ Successful Operations:')
      operations.forEach(op => console.log(`  ${op}`))
    }

    if (errors.length > 0) {
      console.log('\n⚠ Warnings/Errors:')
      errors.forEach(err => console.log(`  ⚠ ${err}`))
    }

    console.log('\n' + '='.repeat(60))
    console.log(`✅ Database initialization complete! (${operations.length} successful, ${errors.length} warnings)`)
    console.log('='.repeat(60) + '\n')

    process.exit(errors.length === 0 ? 0 : 1)
  } catch (error: unknown) {
    console.error('\n❌ Fatal error during database initialization:')
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Run initialization
initDatabase()
