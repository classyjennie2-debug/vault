// Small helper to ensure the admin account exists in Postgres.
// Usage: DATABASE_URL=... node scripts/upsert-admin.js

const { Pool } = require("pg")
const { randomUUID } = require("crypto")
const bcrypt = require("bcrypt")

async function main() {
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
    // Minimal schema to ensure users table exists (matches lib/db.ts)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE,
        password_hash VARCHAR(255),
        verified BOOLEAN NOT NULL DEFAULT FALSE,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        balance NUMERIC(15,2) NOT NULL DEFAULT 0,
        joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        avatar VARCHAR(500),
        last_login TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    const passwordHash = await bcrypt.hash("F2nny4jj!", 10)
    const now = new Date().toISOString()

    await client.query(
      `
        INSERT INTO users (id, name, email, password_hash, role, balance, verified, joined_at, created_at, updated_at, avatar)
        VALUES ($1, $2, $3, $4, 'admin', 0, TRUE, $5, $5, $5, $6)
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          verified = TRUE,
          role = 'admin',
          updated_at = EXCLUDED.updated_at
      `,
      [
        randomUUID(),
        "Admin User",
        "admin@vaultcapital.bond",
        passwordHash,
        now,
        "https://avatar.vercel.sh/admin",
      ]
    )

    console.log("Admin user ensured: admin@vaultcapital.bond")
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
