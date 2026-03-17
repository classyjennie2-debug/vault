import { NextRequest, NextResponse } from "next/server"
import { requireAuthAPI } from "@/lib/auth"
import { all, run } from "@/lib/db"
import type { WalletAddress } from "@/lib/types"
import { apiLogger } from "@/lib/logging"

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get all wallet addresses from database
    const wallets = await all<WalletAddress>(
      "SELECT * FROM wallet_addresses ORDER BY createdAt DESC"
    )

    return NextResponse.json(wallets)
  } catch (error) {
    apiLogger.error("Error fetching wallets", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuthAPI()
    if (user instanceof NextResponse) return user

    // Check if user is admin
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await req.json()
    const { action, wallet } = body

    if (!action) {
      return NextResponse.json({ error: "Action required" }, { status: 400 })
    }

    if (action === "add") {
      // Add a new wallet address
      if (!wallet || !wallet.coin || !wallet.network || !wallet.address) {
        return NextResponse.json({ error: "Invalid wallet data" }, { status: 400 })
      }

      const id = `w${Date.now()}`
      const now = new Date().toISOString().split("T")[0]

      await run(
        "INSERT INTO wallet_addresses (id, coin, network, address, assignedTo, assignedAt, createdAt, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [id, wallet.coin, wallet.network, wallet.address, null, null, now, "active"]
      )

      return NextResponse.json({
        id,
        ...wallet,
        assignedTo: null,
        assignedAt: null,
        createdAt: now,
        status: "active",
      })
    } else if (action === "delete") {
      // Delete a wallet address
      if (!wallet || !wallet.id) {
        return NextResponse.json({ error: "Wallet ID required" }, { status: 400 })
      }

      // Cannot delete assigned wallets
      const walletData = await all<WalletAddress>(
        "SELECT * FROM wallet_addresses WHERE id = $1",
        [wallet.id]
      )

      if (walletData.length === 0) {
        return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
      }

      if (walletData[0].assignedTo) {
        return NextResponse.json(
          { error: "Cannot delete assigned wallet address" },
          { status: 400 }
        )
      }

      await run("DELETE FROM wallet_addresses WHERE id = $1", [wallet.id])

      return NextResponse.json({ message: "Wallet deleted successfully" })
    } else if (action === "drop") {
      // Unassign a wallet from the assigned user
      if (!wallet || !wallet.id) {
        return NextResponse.json({ error: "Wallet ID required" }, { status: 400 })
      }

      const walletData = await all<WalletAddress>(
        "SELECT * FROM wallet_addresses WHERE id = $1",
        [wallet.id]
      )

      if (walletData.length === 0) {
        return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
      }

      if (!walletData[0].assignedTo) {
        return NextResponse.json(
          { error: "Wallet is not assigned to any user" },
          { status: 400 }
        )
      }

      // Unassign the wallet
      await run(
        "UPDATE wallet_addresses SET assignedTo = NULL, assignedAt = NULL WHERE id = $1",
        [wallet.id]
      )

      return NextResponse.json({ message: "Wallet unassigned successfully" })
    } else if (action === "changeStatus") {
      // Change wallet status
      if (!wallet || !wallet.id || !wallet.status) {
        return NextResponse.json({ error: "Wallet ID and status required" }, { status: 400 })
      }

      const validStatuses = ["active", "inactive", "suspended"]
      if (!validStatuses.includes(wallet.status)) {
        return NextResponse.json(
          { error: `Invalid status. Valid statuses: ${validStatuses.join(", ")}` },
          { status: 400 }
        )
      }

      const walletData = await all<WalletAddress>(
        "SELECT * FROM wallet_addresses WHERE id = $1",
        [wallet.id]
      )

      if (walletData.length === 0) {
        return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
      }

      // Update status
      await run(
        "UPDATE wallet_addresses SET status = $1 WHERE id = $2",
        [wallet.status, wallet.id]
      )

      return NextResponse.json({ message: "Wallet status updated successfully" })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    apiLogger.error("Error managing wallets", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
