import { NavLink } from 'react-router-dom'

const navItems = [
  { name: 'Operations', path: '/' },
  { name: 'Shipments', path: '/shipments' },
  { name: 'Suppliers', path: '/suppliers' },
  { name: 'ROI / Analytics', path: '/decision-roi' },
  { name: 'History', path: '/decision-history'},
]

function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-xl font-bold mb-8 text-purple-400">Supply Chain</h1>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg transition ${
                isActive ? 'bg-purple-600' : 'hover:bg-gray-800'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar