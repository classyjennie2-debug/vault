import { run, get, all } from '@/lib/db'
import { ensureReferralTablesExist } from './referral-schema'

// Configuration constants
export const REFERRAL_BONUS_PERCENTAGE = 10 // 10% bonus on deposits $100+
export const REFERRAL_MIN_DEPOSIT = 100 // Minimum deposit amount to trigger bonus
export const REFERRAL_MIN_REFERRALS_TO_WITHDRAW = 10 // Minimum referrals needed to withdraw

// Generate a unique referral code
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Create a referral code for a user
export async function createReferralCode(userId: string, baseUrl: string) {
  try {
    // Check if user already has an active code
    const existing = await get(
      'SELECT id, code, referral_link, clicks_count FROM referral_codes WHERE user_id = $1 AND is_active = true LIMIT 1',
      [userId]
    )
    
    if (existing) {
      return {
        code: (existing as any).code,
        referralLink: (existing as any).referral_link,
        clicksCount: (existing as any).clicks_count || 0
      }
    }

    // Generate unique code
    let code = generateReferralCode()
    let attempts = 0
    
    while (attempts < 10) {
      const codeExists = await get(
        'SELECT id FROM referral_codes WHERE code = $1',
        [code]
      )
      if (!codeExists) break
      code = generateReferralCode()
      attempts++
    }
    
    if (attempts >= 10) {
      throw new Error('Failed to generate unique referral code after 10 attempts')
    }
    
    const referralLink = `${baseUrl}/register?ref=${code}`
    
    // Insert new code
    await run(
      `INSERT INTO referral_codes (user_id, code, referral_link, is_active, clicks_count)
       VALUES ($1, $2, $3, true, 0)`,
      [userId, code, referralLink]
    )
    
    return { code, referralLink, clicksCount: 0 }
  } catch (error) {
    console.error('[REFERRAL] Create referral code error:', error)
    throw error
  }
}

// Get or create referral code for a user
export async function getOrCreateReferralCode(userId: string, baseUrl: string) {
  const existing = await get(
    'SELECT id, code, referral_link, clicks_count FROM referral_codes WHERE user_id = $1 AND is_active = true',
    [userId]
  )
  
  if (existing) {
    return {
      code: (existing as any).code,
      referralLink: (existing as any).referral_link,
      clicksCount: (existing as any).clicks_count
    }
  }
  
  return createReferralCode(userId, baseUrl)
}

// Track a referral when someone signs up using a code
export async function trackReferral(referrerUserId: string, referredUserId: string, referralCodeId: string) {
  const result = await run(
    `INSERT INTO referrals (referrer_id, referred_user_id, referral_code_id, signup_date)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (referred_user_id) DO NOTHING`,
    [referrerUserId, referredUserId, referralCodeId]
  )
  
  if (result === 0) {
    throw new Error('Failed to track referral')
  }
}

// Get referral code by code string
export async function getReferralCodeByCode(code: string) {
  const result = await get(
    `SELECT id, user_id, code, referral_link, clicks_count, created_at
     FROM referral_codes 
     WHERE code = $1 AND is_active = true`,
    [code]
  )
  
  return result as any
}

// Increment referral code clicks
export async function incrementReferralCodeClicks(codeId: string) {
  await run(
    'UPDATE referral_codes SET clicks_count = clicks_count + 1 WHERE id = $1',
    [codeId]
  )
}

// Create referral bonus when someone deposits
export async function createReferralBonus(
  referrerId: string,
  referralId: string,
  depositTransactionId: string,
  depositAmount: number
) {
  // Calculate bonus
  const bonusAmount = (depositAmount * REFERRAL_BONUS_PERCENTAGE) / 100
  
  // Insert bonus record
  await run(
    `INSERT INTO referral_bonuses (referrer_id, referral_id, deposit_transaction_id, deposit_amount, bonus_amount, bonus_percentage, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
    [referrerId, referralId, depositTransactionId, depositAmount, bonusAmount, REFERRAL_BONUS_PERCENTAGE]
  )
  
  return bonusAmount
}

// Credit referral bonus to user's referral balance
export async function creditReferralBonus(referrerId: string, bonusAmount: number) {
  // Update or create referral balance
  await run(
    `INSERT INTO referral_balance (user_id, balance, total_earned)
     VALUES ($1, $2, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET 
       balance = referral_balance.balance + $2,
       total_earned = referral_balance.total_earned + $2,
       updated_at = NOW()`,
    [referrerId, bonusAmount]
  )
  
  // Mark bonus as credited
  await run(
    `UPDATE referral_bonuses 
     SET status = 'credited', credited_at = NOW()
     WHERE referrer_id = $1 AND status = 'pending'
     ORDER BY created_at ASC
     LIMIT 1`,
    [referrerId]
  )
}

// Get referral dashboard stats for a user
export async function getReferralStats(userId: string) {
  // Ensure referral tables exist (creates them if missing)
  await ensureReferralTablesExist()
  
  // Get or create user's referral code (auto-generate for existing users)
  let referralCode: any = null
  let codeError: Error | null = null
  
  try {
    console.log('[REFERRAL] Attempting to get/create referral code for user:', userId)
    referralCode = await getOrCreateReferralCode(userId, 'https://vaultcapital.bond')
    console.log('[REFERRAL] Successfully got/created referral code:', referralCode?.code)
  } catch (error) {
    codeError = error instanceof Error ? error : new Error(String(error))
    console.error('[REFERRAL] Error getting/creating referral code for user', userId, ':', codeError.message)
    console.error('[REFERRAL] Full error:', codeError)
    
    // Retry once after a short delay
    try {
      console.log('[REFERRAL] Retrying code generation after error...')
      await new Promise(resolve => setTimeout(resolve, 500))
      referralCode = await getOrCreateReferralCode(userId, 'https://vaultcapital.bond')
      console.log('[REFERRAL] Retry successful, created code:', referralCode?.code)
      codeError = null
    } catch (retryError) {
      console.error('[REFERRAL] Retry also failed:', retryError)
    }
  }

  // Initialize referral balance for existing users if not exists
  try {
    await run(
      `INSERT INTO referral_balance (user_id, balance, total_earned, total_withdrawn)
       VALUES ($1, 0, 0, 0)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId]
    )
  } catch (error) {
    // Gracefully handle if referral_balance table doesn't exist yet
    const errorMsg = error instanceof Error ? error.message : String(error)
    if (!errorMsg.includes('referral_balance')) {
      console.error('[REFERRAL] Error initializing referral balance:', error)
    } else {
      console.warn('[REFERRAL] referral_balance table not found, skipping initialization')
    }
  }
  
  // Get total referrals
  let referralCount: any = { count: 0 }
  try {
    referralCount = await get(
      `SELECT COUNT(*) as count 
       FROM referrals 
       WHERE referrer_id = $1 AND status = 'active'`,
      [userId]
    )
  } catch (error) {
    console.warn('[REFERRAL] Could not fetch referral count:', error)
  }
  
  // Get total referral bonuses earned
  let totalBonuses: any = { total: 0 }
  try {
    totalBonuses = await get(
      `SELECT COALESCE(SUM(bonus_amount), 0) as total 
       FROM referral_bonuses 
       WHERE referrer_id = $1 AND status = 'credited'`,
      [userId]
    )
  } catch (error) {
    console.warn('[REFERRAL] Could not fetch total bonuses:', error)
  }
  
  // Get referral balance
  let balance: any = { balance: 0, total_earned: 0, total_withdrawn: 0 }
  try {
    const balanceData = await get(
      `SELECT balance, total_earned, total_withdrawn 
       FROM referral_balance 
       WHERE user_id = $1`,
      [userId]
    )
    if (balanceData) balance = balanceData
  } catch (error) {
    console.warn('[REFERRAL] Could not fetch referral balance:', error)
  }
  
  // Get active referrals with their deposit status
  let activeReferrals: any[] = []
  try {
    activeReferrals = await all(
      `SELECT 
         r.id,
         r.referred_user_id,
         u.email,
         u.name,
         r.signup_date,
         COALESCE(
           (SELECT MAX(amount) FROM transactions 
            WHERE user_id = r.referred_user_id 
            AND type = 'deposit' 
            AND status = 'approved'),
           0
         ) as last_deposit_amount,
         COALESCE(
           (SELECT rb.bonus_amount FROM referral_bonuses rb
            WHERE rb.referral_id = r.id
            LIMIT 1),
           0
         ) as earned_bonus
       FROM referrals r
       JOIN users u ON r.referred_user_id = u.id
       WHERE r.referrer_id = $1 AND r.status = 'active'
       ORDER BY r.created_at DESC`,
      [userId]
    )
  } catch (error) {
    console.warn('[REFERRAL] Could not fetch active referrals:', error)
  }
  
  const totalCount = (referralCount as any)?.count || 0
  const canWithdraw = totalCount >= REFERRAL_MIN_REFERRALS_TO_WITHDRAW
  
  return {
    referralCode: referralCode ? {
      code: referralCode.code,
      referralLink: referralCode.referralLink,
      clicksCount: referralCode.clicksCount || 0
    } : null,
    stats: {
      totalReferrals: totalCount,
      totalEarned: parseFloat((totalBonuses as any)?.total || 0),
      referralBalance: parseFloat((balance as any)?.balance || 0),
      totalWithdrawn: parseFloat((balance as any)?.total_withdrawn || 0),
      canWithdraw,
      referralsNeeded: Math.max(0, REFERRAL_MIN_REFERRALS_TO_WITHDRAW - totalCount)
    },
    referrals: activeReferrals.map((r: any) => ({
      id: r.id,
      referredUserId: r.referred_user_id,
      email: r.email,
      name: r.name,
      signupDate: r.signup_date,
      lastDepositAmount: parseFloat(r.last_deposit_amount),
      earnedBonus: parseFloat(r.earned_bonus)
    }))
  }
}

// Transfer from referral balance to main balance
export async function transferReferralToMainBalance(userId: string, amount: number) {
  // Get current balances
  const referralBalance = await get(
    'SELECT balance FROM referral_balance WHERE user_id = $1',
    [userId]
  )
  
  const userBalance = await get(
    'SELECT balance FROM users WHERE id = $1',
    [userId]
  )
  
  if (!referralBalance || (referralBalance as any).balance < amount) {
    throw new Error('Insufficient referral balance')
  }
  
  const refBalanceBefore = (referralBalance as any).balance
  const userBalanceBefore = parseFloat((userBalance as any)?.balance || 0)
  
  // Update referral balance
  await run(
    `UPDATE referral_balance 
     SET balance = balance - $1, total_withdrawn = total_withdrawn + $1
     WHERE user_id = $2`,
    [amount, userId]
  )
  
  // Update user main balance
  const newUserBalance = userBalanceBefore + amount
  await run(
    'UPDATE users SET balance = $1 WHERE id = $2',
    [newUserBalance, userId]
  )
  
  // Record the withdrawal transaction
  await run(
    `INSERT INTO referral_withdrawals (user_id, amount, referral_balance_before, referral_balance_after, user_balance_before, user_balance_after)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, amount, refBalanceBefore, refBalanceBefore - amount, userBalanceBefore, newUserBalance]
  )
  
  return {
    referralBalanceBefore: refBalanceBefore,
    referralBalanceAfter: refBalanceBefore - amount,
    userBalanceBefore,
    userBalanceAfter: newUserBalance
  }
}

// Check if user can withdraw referral balance
export async function canUserWithdrawReferral(userId: string): Promise<{ canWithdraw: boolean; reason?: string; referralsNeeded: number }> {
  const referrals = await get(
    `SELECT COUNT(*) as count FROM referrals WHERE referrer_id = $1 AND status = 'active'`,
    [userId]
  )
  
  const count = (referrals as any)?.count || 0
  const canWithdraw = count >= REFERRAL_MIN_REFERRALS_TO_WITHDRAW
  
  if (!canWithdraw) {
    return {
      canWithdraw: false,
      reason: `You need at least ${REFERRAL_MIN_REFERRALS_TO_WITHDRAW} active referrals to withdraw. You currently have ${count}.`,
      referralsNeeded: REFERRAL_MIN_REFERRALS_TO_WITHDRAW - count
    }
  }
  
  return { canWithdraw: true, referralsNeeded: 0 }
}

// Initialize referral balance for new user (called after signup)
export async function initializeReferralBalance(userId: string) {
  await run(
    `INSERT INTO referral_balance (user_id, balance, total_earned, total_withdrawn)
     VALUES ($1, 0, 0, 0)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  )
}
