import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function AppLayout() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isCustomer, isDealer, isFinancialInstitution, isAdmin, logout } = useAuth()

  const links = [
    { to: '/', label: 'Home', end: true, roles: ['all'] },
    { to: '/inventory', label: 'Browse Vehicles', roles: ['all'] },
    { to: '/dealer-dashboard', label: 'My Inventory', roles: ['dealer'] },
    { to: '/admin-dashboard', label: 'Admin Dashboard', roles: ['admin'] },
    { to: '/bookings', label: 'My Bookings', roles: ['customer', 'dealer'] },
    { to: '/test-drives', label: 'Test Drives', roles: ['customer', 'dealer'] },
    { to: '/loans', label: 'Loan Applications', roles: ['customer', 'financial_institution'] },
  ]

  const visibleLinks = links.filter(link => {
    if (link.roles.includes('all')) return true
    if (!isAuthenticated) return link.to === '/' || link.to === '/inventory'
    return link.roles.some(role => {
      if (role === 'customer') return isCustomer
      if (role === 'dealer') return isDealer
      if (role === 'financial_institution') return isFinancialInstitution
      if (role === 'admin') return isAdmin
      return false
    })
  })

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-brand-600">
              {isAdmin ? 'Admin Platform' : isDealer ? 'Dealer Platform' : isFinancialInstitution ? 'Financial Portal' : 'Customer Portal'}
            </p>
            <h1 className="font-semibold text-slate-900">
              Omnichannel Auto Sales
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex flex-wrap gap-2" aria-label="Main">
              {visibleLinks.map(({ to, label, end }) => (
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
            {isAuthenticated ? (
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <NavLink
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500">
        Omnichannel Auto Sales Platform — Secure Role-Based Access
      </footer>
    </div>
  )
}
