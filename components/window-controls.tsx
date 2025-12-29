"use client"

export default function WindowControls() {
  const handleMinimize = () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.minimizeWindow()
    }
  }

  const handleClose = () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.closeWindow()
    }
  }

  return (
    <div className="flex gap-2 absolute top-3 right-3 z-50">
      <button
        onClick={handleMinimize}
        className="w-6 h-6 rounded-full bg-[#ECE1E9]/60 hover:bg-[#5B7785]/20 flex items-center justify-center transition-all"
        title="Minimize"
      >
        <span className="text-[#5B7785] text-xs font-bold">−</span>
      </button>
      <button
        onClick={handleClose}
        className="w-6 h-6 rounded-full bg-[#ECE1E9]/60 hover:bg-[#C29762]/20 flex items-center justify-center transition-all"
        title="Close"
      >
        <span className="text-[#5B7785] text-xs font-bold">×</span>
      </button>
    </div>
  )
}
