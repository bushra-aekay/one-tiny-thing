"use client"

export default function Navigation({
  currentPage,
  onPageChange,
}: {
  currentPage: "home" | "graph" | "settings"
  onPageChange: (page: "home" | "graph" | "settings") => void
}) {
  return (
    <div className="flex">
      <button
        onClick={() => onPageChange("home")}
        className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
          currentPage === "home" ? "bg-[#efe9df] text-[#3d3d3d]" : "bg-transparent text-[#6b665f] hover:bg-[#f6f4f2]"
        }`}
      >
        home
      </button>
      <button
        onClick={() => onPageChange("graph")}
        className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
          currentPage === "graph" ? "bg-[#efe9df] text-[#3d3d3d]" : "bg-transparent text-[#6b665f] hover:bg-[#f6f4f2]"
        }`}
      >
        graph
      </button>
      <button
        onClick={() => onPageChange("settings")}
        className={`flex-1 px-4 py-3 text-xs font-medium transition-colors ${
          currentPage === "settings" ? "bg-[#efe9df] text-[#3d3d3d]" : "bg-transparent text-[#6b665f] hover:bg-[#f6f4f2]"
        }`}
      >
        settings
      </button>
    </div>
  )
}
