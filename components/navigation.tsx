"use client"

export default function Navigation({
  currentPage,
  onPageChange,
}: {
  currentPage: "home" | "graph" | "settings"
  onPageChange: (page: "home" | "graph" | "settings") => void
}) {
  return (
    <div className="flex border-t-2 border-purple-200 bg-gradient-to-r from-purple-50 to-emerald-50">
      <button
        onClick={() => onPageChange("home")}
        className={`flex-1 px-4 py-4 text-sm font-semibold transition-all ${
          currentPage === "home" ? "bg-white/80 text-purple-700 border-t-2 border-purple-500 -mt-0.5" : "text-purple-400 hover:text-purple-600 hover:bg-white/40"
        }`}
      >
        home
      </button>
      <button
        onClick={() => onPageChange("graph")}
        className={`flex-1 px-4 py-4 text-sm font-semibold transition-all ${
          currentPage === "graph" ? "bg-white/80 text-purple-700 border-t-2 border-purple-500 -mt-0.5" : "text-purple-400 hover:text-purple-600 hover:bg-white/40"
        }`}
      >
        progress
      </button>
      <button
        onClick={() => onPageChange("settings")}
        className={`flex-1 px-4 py-4 text-sm font-semibold transition-all ${
          currentPage === "settings" ? "bg-white/80 text-purple-700 border-t-2 border-purple-500 -mt-0.5" : "text-purple-400 hover:text-purple-600 hover:bg-white/40"
        }`}
      >
        settings
      </button>
    </div>
  )
}
