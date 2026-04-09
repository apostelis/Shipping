import { fmtDollar, fmtDollarFull, fmtNumber, fmtNumberFull } from '../utils/format'

export function AbbrDollar({ value, className }) {
  return (
    <span title={fmtDollarFull(value)} className={`cursor-default ${className || ''}`}>
      {fmtDollar(value)}
    </span>
  )
}

export function AbbrNumber({ value, suffix, className }) {
  return (
    <span title={fmtNumberFull(value)} className={`cursor-default ${className || ''}`}>
      {fmtNumber(value)}{suffix ? ` ${suffix}` : ''}
    </span>
  )
}
