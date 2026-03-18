-- Vault Platform Database Schema
-- PostgreSQL initialization script
-- Run this to set up all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  phone_country VARCHAR(10), -- Country code for phone number (US, UK, CA, etc.)
  date_of_birth DATE,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  avatar VARCHAR(500),
  verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  zip_code VARCHAR(20),
  address TEXT,
  profile_image_url VARCHAR(500),
  
  -- Security fields
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(32),
  backup_codes TEXT[], -- Array of encrypted backup codes
  
  -- Account status
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, deleted
  
  -- Account deletion (soft delete)
  deletion_reason VARCHAR(500),
  deleted_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);

-- Email verification codes
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  expiresAt TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_code (code),
  INDEX idx_expiresAt (expiresAt)
);

-- Activity logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- login, logout, deposit, withdrawal, investment, password_change, profile_update, device_change
  description TEXT,
  location VARCHAR(255),
  device VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success', -- success, failed, pending
  metadata JSONB, -- Additional data as JSON
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id_created (user_id, created_at DESC),
  INDEX idx_type (type),
  INDEX idx_created_at (created_at)
);

-- Investment plans
CREATE TABLE IF NOT EXISTS investment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  plan_type VARCHAR(100) NOT NULL, -- Conservative, Growth, Aggressive, etc.
  min_amount DECIMAL(15,2) NOT NULL,
  max_amount DECIMAL(15,2) NOT NULL,
  return_rate DECIMAL(5,2) NOT NULL,
  duration INTEGER NOT NULL, -- in months or days
  duration_unit VARCHAR(20) DEFAULT 'months',
  risk VARCHAR(20), -- Low, Medium, High
  category VARCHAR(100),
  
  -- Fees
  management_fee DECIMAL(5,2),
  performance_fee DECIMAL(5,2),
  withdrawal_fee DECIMAL(5,2),
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_plan_type (plan_type),
  INDEX idx_active (active),
  INDEX idx_created_at (created_at)
);

-- User investments
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES investment_plans(id),
  amount DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, completed, cancelled
  
  -- Returns
  return_rate DECIMAL(5,2),
  projected_return DECIMAL(15,2),
  actual_return DECIMAL(15,2),
  
  -- Dates
  start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  maturity_date TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_plan_id (plan_id),
  INDEX idx_status (status),
  INDEX idx_start_date (start_date),
  INDEX idx_maturity_date (maturity_date)
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- deposit, withdrawal, investment, return, transfer, fee
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected, cancelled
  description TEXT,
  
  -- Withdrawal/Deposit specific fields
  method VARCHAR(50), -- bank, crypto
  bank_account VARCHAR(255), -- Bank account number
  crypto_address VARCHAR(255), -- Cryptocurrency wallet address
  metadata JSONB, -- Additional data: coin, coinAmount, withdrawalFee, amountAfterFee
  
  -- Related records
  investment_id UUID REFERENCES investments(id),
  reference_id VARCHAR(255), -- External transaction ID
  
  -- Approval
  approved_by UUID REFERENCES users(id),
  approval_comment TEXT,
  approved_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date TEXT, -- Legacy field for SQLite compatibility
  
  INDEX idx_user_id_created (user_id, created_at DESC),
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_investment_id (investment_id)
);

-- Transaction receipts (PDF/documents)
CREATE TABLE IF NOT EXISTS transaction_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255),
  file_path VARCHAR(500),
  file_size INTEGER,
  mime_type VARCHAR(100),
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_user_id (user_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  type VARCHAR(50), -- success, info, warning, error
  read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500),
  
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  
  INDEX idx_user_id_read (user_id, read),
  INDEX idx_user_id_created (user_id, created_at DESC),
  INDEX idx_created_at (created_at)
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Preferences
  theme VARCHAR(20) DEFAULT 'light', -- light, dark, system
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'UTC',
  
  -- Notifications
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  sms_notifications_enabled BOOLEAN DEFAULT FALSE,
  push_notifications_enabled BOOLEAN DEFAULT TRUE,
  
  -- Privacy
  two_factor_required BOOLEAN DEFAULT FALSE,
  login_alerts_enabled BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id)
);

-- Admin logs (for audit trail)
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_admin_id (admin_id),
  INDEX idx_created_at (created_at),
  INDEX idx_resource (resource_type, resource_id)
);

-- Create indexes for frequent queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
  ON transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_investments_user_status 
  ON investments(user_id, status);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_date 
  ON activity_logs(user_id, created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investment_plans_updated_at ON investment_plans;
CREATE TRIGGER update_investment_plans_updated_at BEFORE UPDATE ON investment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_investments_updated_at ON investments;
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default investment plans
INSERT INTO investment_plans (name, description, plan_type, min_amount, max_amount, return_rate, duration, risk)
VALUES
  ('Conservative Bond Fund', 'Low-risk bond portfolio', 'Conservative', 100, 100000, 4.5, 6, 'Low'),
  ('Growth Stock Portfolio', 'Diversified growth stocks', 'Growth', 500, 500000, 8.0, 12, 'Medium'),
  ('Aggressive Tech Fund', 'High-growth technology stocks', 'Aggressive', 1000, 1000000, 15.0, 24, 'High'),
  ('Real Estate Trust', 'Real estate backed investment', 'Real Estate Trust', 2000, 500000, 7.5, 365, 'Medium')
ON CONFLICT DO NOTHING;

-- Create materialized view for user statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS user_investment_stats AS
SELECT 
  u.id as user_id,
  u.email,
  COUNT(DISTINCT i.id) as total_investments,
  SUM(i.amount) as total_invested,
  SUM(i.actual_return) as total_returns,
  MAX(a.created_at) as last_activity
FROM users u
LEFT JOIN investments i ON u.id = i.user_id AND i.status NOT IN ('cancelled')
LEFT JOIN activity_logs a ON u.id = a.user_id
GROUP BY u.id, u.email;

-- Grant permissions (adjust for your users)
-- GRANT SELECT ON investment_plans TO app_user;
-- GRANT USAGE ON SCHEMA public TO app_user;

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Convert integer columns to boolean
-- ─────────────────────────────────────────────────────────────────────────────

-- Convert verification_codes.used from integer to boolean
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'verification_codes' 
    AND column_name = 'used' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE verification_codes 
    ALTER COLUMN used TYPE boolean USING (used::boolean);
    RAISE NOTICE 'Converted verification_codes.used to boolean';
  END IF;
END $$;

-- Convert password_reset_tokens.used from integer to boolean
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'password_reset_tokens' 
    AND column_name = 'used' 
    AND data_type = 'integer'
  ) THEN
    ALTER TABLE password_reset_tokens 
    ALTER COLUMN used TYPE boolean USING (used::boolean);
    RAISE NOTICE 'Converted password_reset_tokens.used to boolean';
  END IF;
END $$;
