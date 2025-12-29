"use client"

export default function Navigation({
  currentPage,
  onPageChange,
}: {
  currentPage: "home" | "graph" | "settings"
  onPageChange: (page: "home" | "graph" | "settings") => void
}) {
  return (
    <div className="flex border-t border-gray-200 bg-gray-50">
      <button
        onClick={() => onPageChange("home")}
        className={`flex-1 px-4 py-4 text-sm font-medium transition-colors ${
          currentPage === "home" ? "bg-white text-blue-600 border-t-2 border-blue-500" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
      >
        home
      </button>
      <button
        onClick={() => onPageChange("graph")}
        className={`flex-1 px-4 py-4 text-sm font-medium transition-colors ${
          currentPage === "graph" ? "bg-white text-blue-600 border-t-2 border-blue-500" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
      >
        progress
      </button>
      <button
        onClick={() => onPageChange("settings")}
        className={`flex-1 px-4 py-4 text-sm font-medium transition-colors ${
          currentPage === "settings" ? "bg-white text-blue-600 border-t-2 border-blue-500" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        }`}
      >
        settings
      </button>
    </div>
  )
}
