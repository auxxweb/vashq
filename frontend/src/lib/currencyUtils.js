/**
 * Format a number as currency using the platform currency code.
 * Uses Intl.NumberFormat so symbols match (e.g. INR → ₹, USD → $).
 * @param {number} amount - Value to format
 * @param {string} [currencyCode='USD'] - ISO 4217 currency code (USD, INR, EUR, GBP, etc.)
 * @returns {string} Formatted string e.g. "₹100.00" or "$100.00"
 */
export function formatCurrency(amount, currencyCode = 'USD') {
  const num = Number(amount)
  if (isNaN(num)) return '0.00'
  const code = (currencyCode || 'USD').toUpperCase()
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
  } catch {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
  }
}
