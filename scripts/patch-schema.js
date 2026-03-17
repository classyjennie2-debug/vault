// One-off schema patch for Neon Postgres.
// Adds missing columns used by investment plans and wallet deposits,
// and ensures activity_logs exists. Run with:
// DATABASE_URL=... node scripts/patch-schema.js

const { Pool } = require("pg")

const sqlStatements = [
  // normalize legacy minamount -> min_amount
  `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'investment_plans' AND column_name = 'minamount'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'investment_plans' AND column_name = 'min_amount'
    ) THEN
      ALTER TABLE investment_plans RENAME COLUMN minamount TO min_amount;
    END IF;
  END $$;`,

  // investment_plans columns
  `ALTER TABLE investment_plans ADD COLUMN IF NOT EXISTS min_amount REAL`,
  `ALTER TABLE investment_plans ADD COLUMN IF NOT EXISTS max_amount REAL`,
  `ALTER TABLE investment_plans ADD COLUMN IF NOT EXISTS return_rate REAL`,
  `ALTER TABLE investment_plans ADD COLUMN IF NOT EXISTS duration INTEGER`,
  `ALTER TABLE investment_plans ADD COLUMN IF NOT EXISTS duration_unit TEXT`,
  `ALTER TABLE investment_plans ADD COLUMN IF NOT EXISTS plan_type TEXT`,
  `ALTER TABLE investment_plans ADD COLUMN IF NOT EXISTS category TEXT`,
  `ALTER TABLE investment_plans ADD COLUMN IF NOT EXISTS management_fee REAL`,
  `ALTER TABLE investment_plans ADD COLUMN IF NOT EXISTS performance_fee REAL`,
  `ALTER TABLE investment_plans ADD COLUMN IF NOT EXISTS withdrawal_fee REAL`,

  // drop legacy camelCase/lowercase columns that are NOT NULL without defaults
  `ALTER TABLE investment_plans DROP COLUMN IF EXISTS minamount`,
  `ALTER TABLE investment_plans DROP COLUMN IF EXISTS maxamount`,
  `ALTER TABLE investment_plans DROP COLUMN IF EXISTS returnrate`,
  `ALTER TABLE investment_plans DROP COLUMN IF EXISTS durationunit`,
  `ALTER TABLE investment_plans DROP COLUMN IF EXISTS plantype`,

  // transactions table: legacy camelCase -> snake_case
  `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'transactions' AND column_name = 'userId'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'transactions' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE transactions RENAME COLUMN "userId" TO user_id;
    END IF;
  END $$;`,

  // also handle lowercase legacy 'userid'
  `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'transactions' AND column_name = 'userid'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'transactions' AND column_name = 'user_id'
    ) THEN
      ALTER TABLE transactions RENAME COLUMN userid TO user_id;
    END IF;
  END $$;`,

  // notifications table normalization (camelCase -> snake_case)
  `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS user_id TEXT`,
  `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'userid'
    ) THEN
      UPDATE notifications SET user_id = COALESCE(user_id, "userId");
      ALTER TABLE notifications DROP COLUMN "userId";
    END IF;
  END $$;`,

  `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'userid'
    ) THEN
      UPDATE notifications SET user_id = COALESCE(user_id, userid);
      ALTER TABLE notifications DROP COLUMN userid;
    END IF;
  END $$;`,

  `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read BOOLEAN`,
  `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'isread'
    ) THEN
      UPDATE notifications SET read = COALESCE(read, CAST("isRead" AS BOOLEAN));
      ALTER TABLE notifications DROP COLUMN "isRead";
    END IF;
  END $$;`,

  `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'isread'
    ) THEN
      UPDATE notifications SET read = COALESCE(read, CAST(isread AS BOOLEAN));
      ALTER TABLE notifications DROP COLUMN isread;
    END IF;
  END $$;`,

  `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_at TIMESTAMP`,
  `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'timestamp'
    ) THEN
      UPDATE notifications SET created_at = COALESCE(created_at, CAST("timestamp" AS TIMESTAMP));
      ALTER TABLE notifications DROP COLUMN "timestamp";
    END IF;
  END $$;`,

  `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'timestamp'
    ) THEN
      UPDATE notifications SET created_at = COALESCE(created_at, CAST(timestamp AS TIMESTAMP));
      ALTER TABLE notifications DROP COLUMN timestamp;
    END IF;
  END $$;`,

  `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT`,
  `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'actionurl'
    ) THEN
      UPDATE notifications SET action_url = COALESCE(action_url, "actionUrl");
      ALTER TABLE notifications DROP COLUMN "actionUrl";
    END IF;
  END $$;`,

  `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'notifications' AND column_name = 'actionurl'
    ) THEN
      UPDATE notifications SET action_url = COALESCE(action_url, actionurl);
      ALTER TABLE notifications DROP COLUMN actionurl;
    END IF;
  END $$;`,

  // wallet_addresses columns
  `ALTER TABLE wallet_addresses ADD COLUMN IF NOT EXISTS assignedTo TEXT`,
  `ALTER TABLE wallet_addresses ADD COLUMN IF NOT EXISTS assignedAt TEXT`,
  `ALTER TABLE wallet_addresses ADD COLUMN IF NOT EXISTS createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
  `ALTER TABLE wallet_addresses ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'`,

  // activity_logs table
  `CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`
]

async function run() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error("DATABASE_URL is required")
    process.exit(1)
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
  })

  const client = await pool.connect()
  try {
    for (const sql of sqlStatements) {
      process.stdout.write(`→ ${sql.split("\n")[0].slice(0, 80)}... `)
      await client.query(sql)
      process.stdout.write("ok\n")
    }
    console.log("Schema patch complete.")
  } finally {
    client.release()
    await pool.end()
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
