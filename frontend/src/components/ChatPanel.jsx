import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { api } from '../api/client'

export default function ChatPanel() {
  const { dark } = useTheme()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your shipping intelligence assistant. Ask me anything about routes, demand, costs, or forecasts. For example:\n\n\u2022 "What\'s the cheapest route from Shanghai to Rotterdam?"\n\u2022 "Show me demand trends for the Asia-Europe lane"\n\u2022 "Compare routing options from Dubai to Hamburg"' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const data = await api.chat(userMsg)
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-violet-500 text-white shadow-lg hover:bg-violet-600 transition-colors flex items-center justify-center"
        title="Ask AI"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 3C7 3 3 6.5 3 11c0 2.5 1.2 4.7 3 6.2V21l3.5-2c.8.2 1.6.3 2.5.3 5 0 9-3.5 9-8s-4-8-9-8z"/>
          <path d="M8 11h.01M12 11h.01M16 11h.01"/>
        </svg>
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-96 rounded-stripe border shadow-lg flex flex-col ${
      dark ? 'bg-gray-950 border-white/10' : 'bg-white border-stripe-border'
    }`} style={{ height: '500px' }}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b shrink-0 ${dark ? 'border-white/5' : 'border-stripe-border'}`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-400"></span>
          <span className={`text-sm font-normal ${dark ? 'text-white/80' : 'text-stripe-navy'}`}>Shipping AI Assistant</span>
        </div>
        <button onClick={() => setOpen(false)} className={`text-lg leading-none ${dark ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}`}>
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-stripe px-3 py-2 text-sm whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-violet-500 text-white'
                : dark
                  ? 'bg-white/5 text-white/70'
                  : 'bg-gray-100 text-stripe-navy'
            }`} style={{ fontWeight: 300, lineHeight: 1.5 }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className={`rounded-stripe px-3 py-2 text-sm ${dark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-stripe-body'}`}>
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`px-4 py-3 border-t shrink-0 ${dark ? 'border-white/5' : 'border-stripe-border'}`}>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about routes, demand, costs..."
            className={`flex-1 text-sm rounded px-3 py-2 border focus:outline-none ${
              dark
                ? 'bg-white/5 border-white/10 text-white/80 placeholder:text-white/20 focus:border-violet-500'
                : 'bg-white border-stripe-border text-stripe-navy placeholder:text-stripe-body/50 focus:border-stripe-purple'
            }`}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-violet-500 text-white px-3 py-2 rounded text-sm hover:bg-violet-600 transition-colors disabled:opacity-40"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2L7 9M14 2l-5 12-2-5-5-2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
