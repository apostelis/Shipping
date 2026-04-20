import { useEffect, useState } from 'react'

export default function ScenarioTransition({ scenarioId }) {
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(true)
    const timer = setTimeout(() => setActive(false), 600)
    return () => clearTimeout(timer)
  }, [scenarioId])

  if (!active) return null

  return (
    <div
      className="fixed inset-0 z-40 pointer-events-none"
      style={{
        background: 'radial-gradient(circle at center, rgba(167,139,250,0.08) 0%, transparent 70%)',
        animation: 'scenarioPulse 0.6s ease-out forwards',
      }}
    />
  )
}
