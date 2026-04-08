import { NavLink, Outlet } from 'react-router-dom'
import { useScenario } from '../hooks/useScenario'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '\u25A6' },
  { to: '/routes', label: 'Route Optimizer', icon: '\u25C8' },
  { to: '/forecast', label: 'Demand Forecast', icon: '\u25F2' },
]

export default function Layout() {
  const { scenarios, activeScenario, switchScenario } = useScenario()

  return (
    <div className="flex h-screen bg-white">
      <aside className="w-60 border-r border-stripe-border flex flex-col">
        <div className="p-6 border-b border-stripe-border">
          <h1 className="text-lg font-light tracking-tight text-stripe-navy">
            SmartShipping
          </h1>
          <p className="text-xs text-stripe-body mt-1">Intelligence Platform</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-stripe text-sm transition-colors ${
                  isActive
                    ? 'bg-stripe-purple/5 text-stripe-purple font-normal'
                    : 'text-stripe-body hover:text-stripe-navy hover:bg-gray-50'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-stripe-border">
          <p className="text-xs text-stripe-body mb-2 font-normal">Demo Scenario</p>
          <select
            value={activeScenario}
            onChange={(e) => switchScenario(e.target.value)}
            className="w-full text-sm border border-stripe-border rounded px-2 py-1.5 text-stripe-navy focus:border-stripe-purple focus:outline-none"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
