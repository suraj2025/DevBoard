import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/tasks',     icon: '✓', label: 'Tasks' },
  { to: '/habits',    icon: '◎', label: 'Habits' },
  { to: '/reports',   icon: '⌇', label: 'Reports' },
  { to: '/settings',  icon: '⚙', label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-white border-r border-gray-200 flex flex-col z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">&lt;/&gt;</span>
        </div>
        <span className="font-semibold text-gray-900 text-sm">DevBoard</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}