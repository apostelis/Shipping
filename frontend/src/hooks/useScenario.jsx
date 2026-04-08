import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../api/client'

const ScenarioContext = createContext(null)

export function ScenarioProvider({ children }) {
  const [scenarios, setScenarios] = useState([])
  const [activeScenario, setActiveScenario] = useState('normal')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getScenarios().then(setScenarios).finally(() => setLoading(false))
  }, [])

  const switchScenario = async (scenarioId) => {
    setLoading(true)
    try {
      await api.applyScenario(scenarioId)
      setActiveScenario(scenarioId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScenarioContext.Provider value={{ scenarios, activeScenario, switchScenario, loading }}>
      {children}
    </ScenarioContext.Provider>
  )
}

export function useScenario() {
  const ctx = useContext(ScenarioContext)
  if (!ctx) throw new Error('useScenario must be used within ScenarioProvider')
  return ctx
}
