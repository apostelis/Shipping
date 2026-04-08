import { NavLink, Outlet } from 'react-router-dom'
import { useScenario } from '../hooks/useScenario'
import { useTheme } from '../hooks/useTheme'

const navItems = [
  { to: '/', label: 'Dashboard', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="7" height="7" rx="1"/><rect x="10" y="1" width="7" height="7" rx="1"/><rect x="1" y="10" width="7" height="7" rx="1"/><rect x="10" y="10" width="7" height="7" rx="1"/></svg> },
  { to: '/routes', label: 'Route Optimizer', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 15l4-6 4 3 4-7"/><circle cx="3" cy="15" r="1.5"/><circle cx="15" cy="5" r="1.5"/></svg> },
  { to: '/forecast', label: 'Demand Forecast', icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 13l4-4 4 2 8-8"/><path d="M13 3h4v4"/></svg> },
]

export default function Layout() {
  const { scenarios, activeScenario, switchScenario } = useScenario()
  const { dark, toggle } = useTheme()

  return (
    <div className={`flex h-screen transition-colors duration-300 ${dark ? 'bg-gray-950 text-white/90' : 'bg-white text-stripe-navy'}`}>
      {/* Sidebar */}
      <aside className={`w-60 shrink-0 flex flex-col border-r transition-colors duration-300 ${dark ? 'border-white/5 bg-gray-950' : 'border-stripe-border bg-white'}`}>
        <div className={`p-6 border-b ${dark ? 'border-white/5' : 'border-stripe-border'}`}>
          <h1 className={`text-lg font-light tracking-tight ${dark ? 'text-white/90' : 'text-stripe-navy'}`}>
            SmartShipping
          </h1>
          <p className={`text-xs mt-1 ${dark ? 'text-white/40' : 'text-stripe-body'}`}>Intelligence Platform</p>
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
                    ? dark
                      ? 'bg-violet-500/10 text-violet-400 font-normal'
                      : 'bg-stripe-purple/5 text-stripe-purple font-normal'
                    : dark
                      ? 'text-white/40 hover:text-white/70 hover:bg-white/5'
                      : 'text-stripe-body hover:text-stripe-navy hover:bg-gray-50'
                }`
              }
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className={`px-4 py-3 border-t ${dark ? 'border-white/5' : 'border-stripe-border'}`}>
          <button
            onClick={toggle}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-stripe text-sm transition-colors ${
              dark ? 'text-white/40 hover:text-white/70 hover:bg-white/5' : 'text-stripe-body hover:text-stripe-navy hover:bg-gray-50'
            }`}
          >
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="3.5"/>
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 8.5A6.5 6.5 0 017.5 2 5.5 5.5 0 1014 8.5z"/>
              </svg>
            )}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>

        {/* Scenario selector */}
        <div className={`p-4 border-t ${dark ? 'border-white/5' : 'border-stripe-border'}`}>
          <p className={`text-xs mb-2 font-normal ${dark ? 'text-white/30' : 'text-stripe-body'}`}>Demo Scenario</p>
          <select
            value={activeScenario}
            onChange={(e) => switchScenario(e.target.value)}
            className={`w-full text-sm border rounded px-2 py-1.5 focus:outline-none transition-colors ${
              dark
                ? 'bg-white/5 border-white/10 text-white/80 focus:border-violet-500'
                : 'bg-white border-stripe-border text-stripe-navy focus:border-stripe-purple'
            }`}
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id} className={dark ? 'bg-gray-900' : ''}>{s.name}</option>
            ))}
          </select>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
