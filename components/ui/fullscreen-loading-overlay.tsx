import { Loader2 } from "lucide-react"

interface FullScreenLoadingOverlayProps {
  open: boolean
  label: string
  testId?: string
}

export function FullScreenLoadingOverlay({ open, label, testId }: FullScreenLoadingOverlayProps) {
  if (!open) return null
  return (
    <div
      data-testid={testId ?? 'fullscreen-loading-overlay'}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
      <p className="text-white text-lg font-medium">{label}</p>
    </div>
  )
}
