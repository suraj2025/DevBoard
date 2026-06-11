import { useAuthStore } from "../store/authStore" 

export default function Navbar() {
  const { user, logout } = useAuthStore()

  return (
    <header className="fixed top-0 left-56 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-end px-6 gap-4 z-10">
      <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
        <span className="text-xl">🔔</span>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white text-xs font-medium">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
      </div>

      <button
        onClick={logout}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        logout
      </button>
    </header>
  )
}