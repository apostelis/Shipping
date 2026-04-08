import { useState, useEffect } from 'react'

export default function IntroOverlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('intro-seen')
    if (!seen) setVisible(true)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem('intro-seen', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stripe-dark/95 backdrop-blur-sm">
      <div className="text-center max-w-lg px-8">
        <h1 className="text-5xl font-light tracking-tight text-white" style={{ letterSpacing: '-1.4px' }}>
          SmartShipping
        </h1>
        <p className="text-white/70 text-lg font-light mt-4">
          AI-Powered Shipping Intelligence
        </p>
        <p className="text-white/50 text-sm font-light mt-2 max-w-md mx-auto">
          Explore how artificial intelligence optimizes routes, predicts demand,
          and handles disruptions across global shipping operations.
        </p>
        <button
          onClick={dismiss}
          className="mt-8 bg-stripe-purple text-white px-6 py-2.5 rounded text-sm font-normal hover:bg-stripe-purple-hover transition-colors"
        >
          Start Exploring
        </button>
      </div>
    </div>
  )
}
