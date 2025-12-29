"use client"

export default function Navigation({
  currentPage,
  onPageChange,
}: {
  currentPage: "home" | "graph" | "settings"
  onPageChange: (page: "home" | "graph" | "settings") => void
}) {
  return (
    <div className="flex border-t border-[#5B7785]/20 bg-[#ECE1E9]/30">
      <button
        onClick={() => onPageChange("home")}
        className={`flex-1 px-4 py-3 text-xs font-medium transition-all ${
          currentPage === "home" ? "bg-white/50 text-[#2E6467]" : "text-[#5B7785] hover:text-[#2E6467] hover:bg-white/30"
        }`}
      >
        home
      </button>
      <button
        onClick={() => onPageChange("graph")}
        className={`flex-1 px-4 py-3 text-xs font-medium transition-all ${
          currentPage === "graph" ? "bg-white/50 text-[#2E6467]" : "text-[#5B7785] hover:text-[#2E6467] hover:bg-white/30"
        }`}
      >
        progress
      </button>
      <button
        onClick={() => onPageChange("settings")}
        className={`flex-1 px-4 py-3 text-xs font-medium transition-all ${
          currentPage === "settings" ? "bg-white/50 text-[#2E6467]" : "text-[#5B7785] hover:text-[#2E6467] hover:bg-white/30"
        }`}
      >
        settings
      </button>
    </div>
  )
}
