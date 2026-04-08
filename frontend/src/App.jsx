import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './hooks/useTheme'
import { ScenarioProvider, useScenario } from './hooks/useScenario'
import Layout from './components/Layout'
import IntroOverlay from './components/IntroOverlay'
import AlertToast from './components/AlertToast'
import DashboardPage from './pages/DashboardPage'
import RoutesPage from './pages/RoutesPage'
import ForecastPage from './pages/ForecastPage'

function AppContent() {
  const { activeScenario } = useScenario()
  return (
    <>
      <AlertToast scenarioId={activeScenario} />
      <IntroOverlay />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="forecast" element={<ForecastPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ScenarioProvider>
        <AppContent />
      </ScenarioProvider>
    </ThemeProvider>
  )
}
