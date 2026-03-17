/**
 * MongoDB Database Setup Guide
 * 
 * This file contains MongoDB schema and query examples for migrating from SQLite.
 * To use MongoDB, update environment variables and modify db.ts accordingly.
 */

/**
 * Installation:
 * npm install mongodb
 * 
 * Environment Variables (.env.local):
 * MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vault?retryWrites=true&w=majority
 * NODE_ENV=production
 */

import type { MongoClient as MongoClientType, Db as DbType, ObjectId as ObjectIdType, Collection as CollectionType } from 'mongodb'

let MongoClientClass: unknown = null
let ObjectIdClass: unknown = null

async function loadMongoDriver() {
  if (MongoClientClass && ObjectIdClass) return

  try {
    const mongodb = await import('mongodb')
    MongoClientClass = mongodb.MongoClient
    ObjectIdClass = mongodb.ObjectId
  } catch {
    // MongoDB driver not installed — Mongo functions will throw if used without driver
  }
}

let cachedClient: MongoClientType | null = null
let cachedDb: DbType | null = null

function toObjectId(id: string): ObjectIdType | string {
  if (!ObjectIdClass) return id
  return new (ObjectIdClass as any)(id)
}

/**
 * Connect to MongoDB
 */
export async function connectToMongoDB() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error(
      "MONGODB_URI environment variable is not defined. Please set it in your .env.local file."
    )
  }

  await loadMongoDriver()

  if (!MongoClientClass) {
    throw new Error("MongoDB driver not installed")
  }

  const client = new (MongoClientClass as any)(mongoUri)
  await client.connect()

  const db = client.db("vault")
  cachedClient = client
  cachedDb = db

  console.log("Connected to MongoDB")
  return { client, db }
}

/**
 * Get a specific collection
 */
export async function getCollection(collectionName: string): Promise<CollectionType<any>> {
  const { db } = await connectToMongoDB()
  return db.collection(collectionName) as CollectionType<any>
}

/**
 * Initialize MongoDB Collections and Indexes
 */
export async function initializeMongoDB() {
  const { db } = await connectToMongoDB()

  // Create collections
  const collections = [
    "users",
    "investmentPlans",
    "activeInvestments",
    "deposits",
    "withdrawals",
    "transactions",
    "notifications",
    "cryptoWallets",
    "adminSettings",
    "auditLogs",
  ]

  for (const collectionName of collections) {
    try {
      await db.createCollection(collectionName)
      console.log(`Created collection: ${collectionName}`)
    } catch (error: unknown) {
      if (error instanceof Error && 'codeName' in error && error.codeName === "NamespaceExists") {
        console.log(`Collection ${collectionName} already exists`)
      } else {
        throw error
      }
    }
  }

  // Create indexes for performance
  const usersCollection = db.collection("users")
  await usersCollection.createIndex({ email: 1 }, { unique: true })
  await usersCollection.createIndex({ createdAt: -1 })

  const investmentsCollection = db.collection("activeInvestments")
  await investmentsCollection.createIndex({ userId: 1, status: 1 })
  await investmentsCollection.createIndex({ endDate: 1 })

  const transactionsCollection = db.collection("transactions")
  await transactionsCollection.createIndex({ userId: 1, createdAt: -1 })
  await transactionsCollection.createIndex({ type: 1, status: 1 })

  const depositsCollection = db.collection("deposits")
  await depositsCollection.createIndex({ userId: 1, createdAt: -1 })

  const withdrawalsCollection = db.collection("withdrawals")
  await withdrawalsCollection.createIndex({ userId: 1, createdAt: -1 })

  const notificationsCollection = db.collection("notifications")
  await notificationsCollection.createIndex({ userId: 1, createdAt: -1 })
  await notificationsCollection.createIndex({ userId: 1, isRead: 1 })

  const cryptoWalletsCollection = db.collection("cryptoWallets")
  await cryptoWalletsCollection.createIndex(
    { coin: 1, network: 1, address: 1 },
    { unique: true }
  )
  await cryptoWalletsCollection.createIndex({ assignedToUser: 1 })

  console.log("MongoDB indexes created successfully")
}

// ========================================
// USER OPERATIONS
// ========================================

export async function mongoGetUserById(userId: string) {
  const users = await getCollection("users")
  return users.findOne({ _id: toObjectId(userId) })
}

export async function mongoGetUserByEmail(email: string) {
  const users = await getCollection("users")
  return users.findOne({ email: email.toLowerCase() })
}

export async function mongoCreateUser(userData: {
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  role: "user" | "admin"
}) {
  const users = await getCollection("users")
  const result = await users.insertOne({
    ...userData,
    email: userData.email.toLowerCase(),
    balance: 0,
    totalDeposited: 0,
    totalInvested: 0,
    totalWithdrawn: 0,
    totalProfit: 0,
    status: "active",
    isEmailVerified: false,
    isPhoneVerified: false,
    identityVerified: false,
    twoFactorEnabled: false,
    emailNotifications: true,
    pushNotifications: true,
    preferredCurrency: "USD",
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return result.insertedId
}

// ========================================
// INVESTMENT OPERATIONS
// ========================================

export async function mongoGetAllInvestmentPlans() {
  const plans = await getCollection("investmentPlans")
  return plans.find({ isActive: true }).sort({ displayOrder: 1 }).toArray()
}

export async function mongoGetUserActiveInvestments(userId: string) {
  const investments = await getCollection("activeInvestments")
  return investments
    .find({
      userId: toObjectId(userId),
      status: { $in: ["active", "completed"] },
    })
    .sort({ startDate: -1 })
    .toArray()
}

export async function mongoCreateInvestment(investmentData: {
  userId: string
  planId: string
  investmentAmount: number
  returnRate: number
}) {
  const investments = await getCollection("activeInvestments")

// @ts-expect-error - MongoDB types and usage (this file is for reference only)
  const plan = await getCollection("investmentPlans").findOne({
    _id: toObjectId(investmentData.planId),
  })

  if (!plan) throw new Error("Investment plan not found")

  const expectedProfit =
    (investmentData.investmentAmount * investmentData.returnRate) / 100
  const endDate = new Date()
  endDate.setDate(
    endDate.getDate() +
      (plan.durationUnit === "days" ? plan.duration : plan.duration * 30)
  )

  const result = await investments.insertOne({
    userId: toObjectId(investmentData.userId),
    planId: toObjectId(investmentData.planId),
    investmentAmount: investmentData.investmentAmount,
    expectedProfit,
    totalReturn: investmentData.investmentAmount + expectedProfit,
    returnRate: investmentData.returnRate,
    startDate: new Date(),
    endDate,
    status: "active",
    profitAccrued: 0,
    progressPercentage: 0,
    bonusApplied: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return result.insertedId
}

// ========================================
// DEPOSIT OPERATIONS
// ========================================

export async function mongoCreateDeposit(depositData: {
  userId: string
  amount: number
  paymentMethod: string
  details?: Record<string, unknown>
}) {
  const deposits = await getCollection("deposits")
  const result = await deposits.insertOne({
    userId: toObjectId(depositData.userId),
    amount: depositData.amount,
    currency: "USD",
    paymentMethod: depositData.paymentMethod,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...(depositData.details && depositData.details),
  })
  return result.insertedId
}

export async function mongoApproveDeposit(depositId: string, adminId: string) {
  const deposits = await getCollection("deposits")

  const deposit = await deposits.findOne({ _id: toObjectId(depositId) })
  if (!deposit) throw new Error("Deposit not found")

  await deposits.updateOne(
    { _id: toObjectId(depositId) },
    {
      $set: {
        status: "approved",
        processedBy: toObjectId(adminId),
        processedAt: new Date(),
        updatedAt: new Date(),
      },
    }
  )

  // Update user balance
  const users = await getCollection("users")
  await users.updateOne(
    { _id: toObjectId(String(deposit.userId)) },
    {
      $inc: {
        balance: deposit.amount,
        totalDeposited: deposit.amount,
      },
      $set: { updatedAt: new Date() },
    }
  )

  // Create transaction record
  await mongoCreateTransaction({
    userId: deposit.userId.toString(),
    type: "deposit",
    amount: deposit.amount,
    description: "Deposit approved",
    status: "completed",
  })
}

// ========================================
// WITHDRAWAL OPERATIONS
// ========================================

export async function mongoCreateWithdrawal(withdrawalData: {
  userId: string
  amount: number
  method: string
  details?: Record<string, unknown>
}) {
  const withdrawals = await getCollection("withdrawals")
  const fee = Math.max(withdrawalData.amount * 0.01, 1)

  const result = await withdrawals.insertOne({
    userId: toObjectId(withdrawalData.userId),
    amount: withdrawalData.amount,
    method: withdrawalData.method,
    fee,
    netAmount: withdrawalData.amount - fee,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...(withdrawalData.details && withdrawalData.details),
  })
  return result.insertedId
}

// ========================================
// TRANSACTION OPERATIONS
// ========================================

export async function mongoCreateTransaction(transactionData: {
  userId: string
  type: string
  amount: number
  description: string
  status: string
}) {
  const transactions = await getCollection("transactions")
  const result = await transactions.insertOne({
    userId: toObjectId(transactionData.userId),
    type: transactionData.type,
    amount: transactionData.amount,
    description: transactionData.description,
    status: transactionData.status,
    createdAt: new Date(),
  })
  return result.insertedId
}

export async function mongoGetUserTransactions(userId: string, limit = 20) {
  const transactions = await getCollection("transactions")
  return transactions
    .find({ userId: toObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}

// ========================================
// NOTIFICATION OPERATIONS
// ========================================

export async function mongoCreateNotification(notificationData: {
  userId: string
  title: string
  message: string
  type: string
  actionUrl?: string
}) {
  const notifications = await getCollection("notifications")
  const result = await notifications.insertOne({
    userId: toObjectId(notificationData.userId),
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type,
    isRead: false,
    actionUrl: notificationData.actionUrl,
    createdAt: new Date(),
  })
  return result.insertedId
}

export async function mongoGetUserNotifications(userId: string) {
  const notifications = await getCollection("notifications")
  return notifications
    .find({ userId: toObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function mongoMarkNotificationAsRead(notificationId: string) {
  const notifications = await getCollection("notifications")
  return notifications.updateOne(
    { _id: toObjectId(notificationId) },
    {
      $set: { isRead: true, readAt: new Date() },
    }
  )
}

/**
 * Migration Helper: Export from SQLite and Import to MongoDB
 * 
 * If migrating from SQLite to MongoDB:
 * 1. Export data from SQLite using better-sqlite3
 * 2. Transform data to match MongoDB schema
 * 3. Use mongoCreateXxx functions to insert into MongoDB
 * 
 * Example:
 * const sqliteUsers = db.prepare('SELECT * FROM users').all()
 * for (const user of sqliteUsers) {
 *   await mongoCreateUser({
 *     email: user.email,
 *     // ... map other fields
 *   })
 * }
 */
