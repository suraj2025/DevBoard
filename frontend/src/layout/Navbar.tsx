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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path d="M352 64C352 46.3 337.7 32 320 32C302.3 32 288 46.3 288 64L288 320C288 337.7 302.3 352 320 352C337.7 352 352 337.7 352 320L352 64zM210.3 162.4C224.8 152.3 228.3 132.3 218.2 117.8C208.1 103.3 188.1 99.8 173.6 109.9C107.4 156.1 64 233 64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 233 532.6 156.1 466.3 109.9C451.8 99.8 431.9 103.3 421.7 117.8C411.5 132.3 415.1 152.2 429.6 162.4C479.4 197.2 511.9 254.8 511.9 320C511.9 426 425.9 512 319.9 512C213.9 512 128 426 128 320C128 254.8 160.5 197.1 210.3 162.4z"/></svg>
      </button>
    </header>
  )
}
