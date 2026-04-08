import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './hooks/useTheme'
import { ScenarioProvider } from './hooks/useScenario'
import Layout from './components/Layout'
import IntroOverlay from './components/IntroOverlay'
import DashboardPage from './pages/DashboardPage'
import RoutesPage from './pages/RoutesPage'
import ForecastPage from './pages/ForecastPage'

export default function App() {
  return (
    <ThemeProvider>
      <ScenarioProvider>
        <IntroOverlay />
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="routes" element={<RoutesPage />} />
            <Route path="forecast" element={<ForecastPage />} />
          </Route>
        </Routes>
      </ScenarioProvider>
    </ThemeProvider>
  )
}
