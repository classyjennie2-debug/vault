import { NextRequest, NextResponse } from "next/server"
import { run, get, all } from "@/lib/db"

/**
 * DEBUG ENDPOINT - Referral System Health Check
 * Verify that all referral tables exist and are accessible
 * Only accessible in development or with admin privileges
 */
export async function GET(req: NextRequest) {
  // Basic security - only allow in development or with specific token
  const token = req.nextUrl.searchParams.get('token')
  const isDevMode = process.env.NODE_ENV === 'development'
  const validToken = process.env.DEBUG_TOKEN && token === process.env.DEBUG_TOKEN
  
  if (!isDevMode && !validToken) {
    return NextResponse.json(
      { error: 'Unauthorized - Debug mode not available in production' },
      { status: 403 }
    )
  }

  const results: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    databaseUrl: process.env.DATABASE_URL ? '✓ Set' : '✗ Missing',
    tables: {}
  }

  // Check each referral table
  const tables = [
    'referral_codes',
    'referrals',
    'referral_bonuses',
    'referral_balance',
    'referral_withdrawals'
  ]

  for (const table of tables) {
    try {
      const result = await get(`SELECT COUNT(*) as count FROM ${table} LIMIT 1`)
      results.tables[table] = {
        status: '✓ Exists',
        rows: result?.count || 0
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      results.tables[table] = {
        status: '✗ Error',
        error: errorMsg,
        suggestion: errorMsg.includes('does not exist')
          ? 'Table does not exist. Run: npx ts-node scripts/ensure-referral-tables.ts'
          : 'Unknown error'
      }
    }
  }

  // Try to test referral code generation for a test user
  const testUserId = req.nextUrl.searchParams.get('testUserId')
  if (testUserId) {
    results.test = {
      userId: testUserId,
      codeGenerationTest: {
        status: 'running',
        startedAt: new Date().toISOString()
      }
    }

    try {
      // Check if user exists
      const userExists = await get('SELECT id FROM users WHERE id = $1', [testUserId])
      if (!userExists) {
        results.test.codeGenerationTest = {
          status: '✗ Failed',
          error: 'User not found',
          userId: testUserId
        }
      } else {
        // Try to get or create a referral code
        const codeResult = await get(
          'SELECT id, code, is_active FROM referral_codes WHERE user_id = $1 AND is_active = true LIMIT 1',
          [testUserId]
        )

        if (codeResult) {
          results.test.codeGenerationTest = {
            status: '✓ Code exists',
            code: codeResult.code,
            isActive: codeResult.is_active
          }
        } else {
          // Try to generate new one
          const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase()
          await run(
            `INSERT INTO referral_codes (user_id, code, referral_link, is_active, clicks_count)
             VALUES ($1, $2, $3, true, 0)
             ON CONFLICT (code) DO NOTHING`,
            [testUserId, randomCode, `https://vaultcapital.bond/register?ref=${randomCode}`]
          )

          results.test.codeGenerationTest = {
            status: '✓ Successfully created test code',
            testCode: randomCode
          }
        }
      }
    } catch (error) {
      results.test.codeGenerationTest = {
        status: '✗ Failed',
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  return NextResponse.json(results)
}
