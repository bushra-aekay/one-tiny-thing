"use client"

export default function Navigation({
  currentPage,
  onPageChange,
}: {
  currentPage: "home" | "graph" | "settings"
  onPageChange: (page: "home" | "graph" | "settings") => void
}) {
  return (
    <div className="flex gap-2 bg-[#ECE1E9]/40 p-1.5 rounded-xl">
      <button
        onClick={() => onPageChange("home")}
        className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
          currentPage === "home" ? "bg-white text-[#2E6467] shadow-sm" : "text-[#5B7785] hover:text-[#2E6467] hover:bg-white/50"
        }`}
      >
        home
      </button>
      <button
        onClick={() => onPageChange("graph")}
        className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
          currentPage === "graph" ? "bg-white text-[#2E6467] shadow-sm" : "text-[#5B7785] hover:text-[#2E6467] hover:bg-white/50"
        }`}
      >
        progress
      </button>
      <button
        onClick={() => onPageChange("settings")}
        className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
          currentPage === "settings" ? "bg-white text-[#2E6467] shadow-sm" : "text-[#5B7785] hover:text-[#2E6467] hover:bg-white/50"
        }`}
      >
        settings
      </button>
    </div>
  )
}
