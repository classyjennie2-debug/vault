/**
 * Format transaction status for display
 * Converts database status values to user-friendly labels
 */
export function formatTransactionStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'approved': 'Successful',
    'rejected': 'Rejected',
  }
  return statusMap[status.toLowerCase()] || status.charAt(0).toUpperCase() + status.slice(1)
}
