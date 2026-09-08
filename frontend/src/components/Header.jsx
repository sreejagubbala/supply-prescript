function Header() {
  return (
    <div className="h-16 bg-gray-800 text-white flex items-center justify-between px-6 border-b border-gray-700">
      <h2 className="text-lg font-semibold">Dashboard</h2>
      <span className="text-sm text-gray-400">Last updated: just now</span>
    </div>
  )
}

export default Header