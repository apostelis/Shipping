import { useEffect, useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { api } from '../api/client'

export default function BookingQueue({ onSelectBooking }) {
  const { dark } = useTheme()
  const [bookings, setBookings] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.getBookings('PENDING').then(setBookings).catch(() => {})
  }, [])

  const handleSelect = (booking) => {
    setSelected(booking.id)
    onSelectBooking(booking)
  }

  if (bookings.length === 0) return null

  return (
    <div className={`rounded-stripe border p-4 mb-6 ${dark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-stripe-border'}`}>
      <div className="flex items-center gap-2 mb-3">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={dark ? '#a78bfa' : '#533afd'} strokeWidth="1.5">
          <rect x="2" y="1" width="12" height="14" rx="1.5"/>
          <path d="M5 5h6M5 8h6M5 11h3"/>
        </svg>
        <span className={`text-xs font-medium tracking-wider uppercase ${dark ? 'text-white/40' : 'text-stripe-body'}`}>Pending Bookings</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded ${dark ? 'bg-violet-500/20 text-violet-400' : 'bg-stripe-purple/10 text-stripe-purple'}`}>{bookings.length}</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {bookings.map(b => (
          <button
            key={b.id}
            onClick={() => handleSelect(b)}
            className={`shrink-0 text-left rounded-stripe p-3 border transition-colors ${
              selected === b.id
                ? dark ? 'bg-violet-950/40 border-violet-500/40' : 'bg-stripe-purple/5 border-stripe-purple/30'
                : dark ? 'bg-gray-950 border-white/5 hover:border-violet-500/20' : 'bg-white border-stripe-border hover:border-stripe-purple/20'
            }`}
            style={{ minWidth: '180px' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-mono ${dark ? 'text-white/30' : 'text-stripe-body'}`}>{b.reference}</span>
            </div>
            <p className={`text-xs font-normal ${dark ? 'text-white/80' : 'text-stripe-navy'}`}>
              {b.originName} &rarr; {b.destinationName}
            </p>
            <div className={`flex gap-3 mt-1 text-[10px] ${dark ? 'text-white/30' : 'text-stripe-body'}`}>
              <span>{b.cargoType}</span>
              <span>{parseFloat(b.volumeTeu).toLocaleString()} TEU</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
