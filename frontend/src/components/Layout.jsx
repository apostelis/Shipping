import { NavLink, Outlet } from 'react-router-dom'
import { useScenario } from '../hooks/useScenario'

const navItems = [
  { to: '/', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="7" height="7" rx="1"/><rect x="10" y="1" width="7" height="7" rx="1"/><rect x="1" y="10" width="7" height="7" rx="1"/><rect x="10" y="10" width="7" height="7" rx="1"/></svg> },
  { to: '/routes', label: 'Route Optimizer', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 15l4-6 4 3 4-7"/><circle cx="3" cy="15" r="1.5"/><circle cx="15" cy="5" r="1.5"/></svg> },
  { to: '/forecast', label: 'Demand Forecast', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 13l4-4 4 2 8-8"/><path d="M13 3h4v4"/></svg> },
]

export default function Layout() {
  const { scenarios, activeScenario, switchScenario } = useScenario()

  return (
    <div className="flex h-screen bg-white">
      <aside className="w-60 shrink-0 border-r border-stripe-border flex flex-col">
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
              {icon}
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
