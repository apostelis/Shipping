export function fmtDollar(v) {
  const n = parseFloat(v)
  if (isNaN(n)) return '$0'
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString()}`
}

export function fmtDollarFull(v) {
  const n = parseFloat(v)
  if (isNaN(n)) return '$0'
  return `$${n.toLocaleString()}`
}

export function fmtNumber(v) {
  const n = parseFloat(v)
  if (isNaN(n)) return '0'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return n.toLocaleString()
}

export function fmtNumberFull(v) {
  const n = parseFloat(v)
  if (isNaN(n)) return '0'
  return n.toLocaleString()
}

export function fmtHours(h) {
  const hours = parseFloat(h)
  if (hours < 24) return `${hours.toFixed(0)}h`
  const days = Math.floor(hours / 24)
  const rem = Math.round(hours % 24)
  return `${days}d ${rem}h`
}
