import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transactionId = params.id

    // TODO: Query transaction from database
    // const transaction = await db.query(
    //   'SELECT * FROM transactions WHERE id = $1 AND userId = $2',
    //   [transactionId, user.id]
    // )

    // Sample transaction data (remove when database integration is ready)
    const transaction = {
      id: transactionId,
      userId: user.id,
      type: "deposit",
      amount: 1000,
      fee: 10,
      total: 1010,
      date: new Date().toISOString(),
      description: "Deposit to Investment Account",
      status: "completed",
    }

    // Generate HTML receipt
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${transaction.id}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .receipt {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 2px solid #007bff;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      color: #333;
    }
    .header p {
      margin: 5px 0;
      color: #666;
    }
    .transaction-details {
      margin: 30px 0;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .detail-label {
      color: #666;
      font-weight: 500;
    }
    .detail-value {
      color: #333;
      font-weight: 500;
    }
    .amount-row {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
    }
    .total-row {
      font-size: 18px;
      color: #007bff;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #007bff;
      color: #666;
      font-size: 12px;
    }
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-completed {
      background-color: #d4edda;
      color: #155724;
    }
    @media print {
      body {
        background: white;
      }
      .receipt {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>Payment Receipt</h1>
      <p>Vault Capital Investment Platform</p>
    </div>

    <div class="transaction-details">
      <div class="detail-row">
        <span class="detail-label">Account Holder:</span>
        <span class="detail-value">${user.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email:</span>
        <span class="detail-value">${user.email}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Transaction ID:</span>
        <span class="detail-value">${transaction.id}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Transaction Type:</span>
        <span class="detail-value">${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date & Time:</span>
        <span class="detail-value">${new Date(transaction.date).toLocaleString()}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status:</span>
        <span class="detail-value">
          <span class="status-badge status-completed">${transaction.status}</span>
        </span>
      </div>
    </div>

    <div class="amount-row">
      <div class="detail-row">
        <span class="detail-label">Subtotal:</span>
        <span class="detail-value">$${transaction.amount.toFixed(2)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Transaction Fee:</span>
        <span class="detail-value">-$${transaction.fee.toFixed(2)}</span>
      </div>
      <div class="detail-row total-row">
        <span>Total Amount:</span>
        <span>$${transaction.total.toFixed(2)}</span>
      </div>
    </div>

    <div class="detail-row">
      <span class="detail-label">Description:</span>
      <span class="detail-value">${transaction.description}</span>
    </div>

    <div class="footer">
      <p>Thank you for using Vault Capital Investment Platform</p>
      <p>For support, please contact support@vaultcapital.com</p>
      <p>This is an automated receipt. Please retain for your records.</p>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
  </div>
  <script>
    // Auto-trigger print dialog on load (optional)
    // window.print();
  </script>
</body>
</html>
    `

    // Check if PDF download is requested
    const url = new URL(req.url)
    const format = url.searchParams.get("format")

    if (format === "pdf") {
      // For PDF generation, would need pdfkit or similar
      // For now, return HTML that can be printed to PDF
      return new NextResponse(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="receipt-${transaction.id}.html"`,
        },
      })
    }

    // Default: return JSON with receipt data
    return NextResponse.json({
      success: true,
      transaction,
      html,
      message: "Receipt generated successfully",
    })
  } catch (error) {
    console.error("Receipt generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 }
    )
  }
}
