import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Overview', end: true },
  { to: '/inventory', label: 'Inventory' },
  { to: '/bookings', label: 'Vehicle booking' },
  { to: '/loans', label: 'Loan approvals' },
  { to: '/test-drives', label: 'Test drives' },
]

export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
              Dealer platform
            </p>
            <h1 className="font-semibold text-slate-900">
              Omnichannel Auto Sales
            </h1>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Main">
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100',
                  ].join(' ')
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500">
        Boilerplate — connect APIs under <code className="text-slate-700">/api</code>
      </footer>
    </div>
  )
}
