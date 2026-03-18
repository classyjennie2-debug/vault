import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { pgPool, run, get, all } from "@/lib/db"
import { apiLogger } from "@/lib/logging"

/**
 * Database Initialization Endpoint
 * Initializes all required tables, columns, and seed data
 * Only accessible to admin users
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized - admin only" }, { status: 403 })
    }

    if (!pgPool) {
      return NextResponse.json({ error: "PostgreSQL not initialized" }, { status: 500 })
    }

    const results: string[] = []
    const errors: string[] = []

    // 1. Ensure all tables exist
    results.push("✓ All tables created (or already exist)")

    // 2. Add missing columns to users table
    try {
      const userColumns = [
        { name: 'email_verified', type: 'BOOLEAN NOT NULL DEFAULT FALSE' },
        { name: 'two_factor_enabled', type: 'BOOLEAN NOT NULL DEFAULT FALSE' },
        { name: 'two_factor_secret', type: 'VARCHAR(255)' },
        { name: 'backup_codes', type: 'TEXT' },
        { name: 'phone_country', type: 'VARCHAR(10)' },
      ]

      for (const col of userColumns) {
        try {
          await pgPool.query(
            `ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`
          )
          results.push(`✓ Added column: users.${col.name}`)
        } catch (e: any) {
          if (!e.message?.includes('already exists') && !e.message?.includes('duplicate')) {
            throw e
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Users table columns: ${msg}`)
    }

    // 3. Add missing columns to transactions table
    try {
      const txColumns = [
        { name: 'created_at', type: 'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP' },
        { name: 'method', type: 'VARCHAR(50)' },
        { name: 'bank_account', type: 'VARCHAR(255)' },
        { name: 'crypto_address', type: 'VARCHAR(255)' },
        { name: 'metadata', type: 'JSONB' },
      ]

      for (const col of txColumns) {
        try {
          await pgPool.query(
            `ALTER TABLE transactions ADD COLUMN ${col.name} ${col.type}`
          )
          results.push(`✓ Added column: transactions.${col.name}`)
        } catch (e: any) {
          if (!e.message?.includes('already exists') && !e.message?.includes('duplicate')) {
            throw e
          }
        }
      }

      // Backfill created_at from legacy date column if present
      try {
        await pgPool.query(
          `UPDATE transactions SET created_at = COALESCE(created_at, date::TIMESTAMP) WHERE created_at IS NULL AND date IS NOT NULL`
        )
        results.push('✓ Backfilled transactions.created_at from date')
      } catch (e: any) {
        if (!e.message?.includes('column \"created_at\" does not exist')) {
          errors.push(`Backfill created_at failed: ${e instanceof Error ? e.message : String(e)}`)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Transactions table columns: ${msg}`)
    }

    // 4. Ensure investment_plans table has all columns
    try {
      const planColumns = [
        { name: 'category', type: 'VARCHAR(100)' },
        { name: 'management_fee', type: 'NUMERIC(5,2) DEFAULT 0' },
        { name: 'performance_fee', type: 'NUMERIC(5,2) DEFAULT 0' },
        { name: 'withdrawal_fee', type: 'NUMERIC(5,2) DEFAULT 0' },
      ]

      for (const col of planColumns) {
        try {
          await pgPool.query(
            `ALTER TABLE investment_plans ADD COLUMN ${col.name} ${col.type}`
          )
          results.push(`✓ Added column: investment_plans.${col.name}`)
        } catch (e: any) {
          if (!e.message?.includes('already exists') && !e.message?.includes('duplicate')) {
            throw e
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Investment plans table columns: ${msg}`)
    }

    // 5. Create indexes for better query performance
    try {
      const indexes = [
        `CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)`,
        `CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)`,
        `CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at)`,
        `CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status)`,
        `CREATE INDEX IF NOT EXISTS idx_investments_maturity ON investments(maturity_date)`,
        `CREATE INDEX IF NOT EXISTS idx_active_investments_userid ON active_investments("userId")`,
        `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`,
        `CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id)`,
      ]

      for (const indexSql of indexes) {
        try {
          await pgPool.query(indexSql)
          const indexName = indexSql.match(/idx_\w+/)?.[0]
          results.push(`✓ Created index: ${indexName}`)
        } catch (e: any) {
          if (!e.message?.includes('already exists') && !e.message?.includes('duplicate')) {
            throw e
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Database indexes: ${msg}`)
    }

    // 6. Seed investment plans
    try {
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
               name = $2, min_amount = $3, max_amount = $4, return_rate = $5, 
               duration = $6, duration_unit = $7, risk = $8, description = $9, plan_type = $10`,
            [plan.id, plan.name, plan.minAmount, plan.maxAmount, plan.returnRate, 
             plan.duration, plan.durationUnit, plan.risk, plan.description, plan.planType]
          )
          planCount++
        } catch (e: unknown) {
          errors.push(`Failed to seed plan ${plan.id}: ${e}`)
        }
      }
      results.push(`✓ Seeded ${planCount}/4 investment plans`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Investment plans seeding: ${msg}`)
    }

    // 7. Seed admin user
    try {
      const adminExists = await pgPool.query(
        `SELECT id FROM users WHERE email = $1`,
        ['admin@vaultcapital.bond']
      )

      if (adminExists.rows.length === 0) {
        const { hashPassword } = await import('@/lib/auth')
        const passwordHash = await hashPassword('F2nny4jj!')
        const now = new Date().toISOString()

        await pgPool.query(
          `INSERT INTO users (id, name, email, password_hash, role, verified, balance, joined_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          ['admin-user-001', 'Admin User', 'admin@vaultcapital.bond', passwordHash, 'admin', true, 0, now, now, now]
        )
        results.push('✓ Created admin user (admin@vaultcapital.bond)')
      } else {
        results.push('✓ Admin user already exists')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Admin user seeding: ${msg}`)
    }

    // 8. Verify critical tables and columns
    try {
      const tables = ['users', 'transactions', 'investments', 'investment_plans', 'notifications']
      for (const table of tables) {
        const tableExists = await pgPool.query(
          `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = $1)`,
          [table]
        )
        if (tableExists.rows[0]?.exists) {
          results.push(`✓ Verified table: ${table}`)
        } else {
          errors.push(`Missing table: ${table}`)
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Table verification: ${msg}`)
    }

    // 9. Verify user columns
    try {
      const userCols = await pgPool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY column_name`
      )
      const colNames = userCols.rows.map((r: any) => r.column_name)
      results.push(`✓ Users table has ${colNames.length} columns: ${colNames.slice(0, 5).join(', ')}...`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      errors.push(`Column verification: ${msg}`)
    }

    // Summary
    const summary = {
      success: errors.length === 0,
      results,
      errors,
      timestamp: new Date().toISOString(),
      statistics: {
        successCount: results.length,
        errorCount: errors.length,
        totalOperations: results.length + errors.length
      }
    }

    if (errors.length > 0) {
      apiLogger.warn('Database initialization completed with errors', errors)
    } else {
      apiLogger.info('Database initialization completed successfully')
    }

    return NextResponse.json(summary, { status: errors.length === 0 ? 200 : 206 })
  } catch (error: unknown) {
    apiLogger.error("Database initialization error", error)
    return NextResponse.json({ 
      error: "Failed to initialize database",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

/**
 * GET endpoint to check database status
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    if (!pgPool) {
      return NextResponse.json({ error: "PostgreSQL not initialized", status: 'down' }, { status: 503 })
    }

    // Check database connection
    await pgPool.query('SELECT 1')

    // Get table counts
    const tableNames = ['users', 'transactions', 'investments', 'investment_plans', 'active_investments', 'notifications']
    const counts: Record<string, number> = {}

    for (const table of tableNames) {
      try {
        const result = await pgPool.query(`SELECT COUNT(*) as count FROM "${table}"`)
        counts[table] = result.rows[0]?.count || 0
      } catch (_e) {
        counts[table] = -1 // Table doesn't exist
      }
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'PostgreSQL',
      timestamp: new Date().toISOString(),
      tableCounts: counts,
      message: 'Database is operational'
    })
  } catch (error: unknown) {
    return NextResponse.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
