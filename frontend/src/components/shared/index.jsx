import React from 'react'
import { Check, CheckCheck, WifiOff, MessageSquare } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'

export function SeenTicks({ delivered, seen, className = '' }) {
  if (seen)      return <CheckCheck className={`w-3.5 h-3.5 text-[#2563eb] ${className}`} strokeWidth={2} />
  if (delivered) return <CheckCheck className={`w-3.5 h-3.5 text-[#a0a0a0] ${className}`} strokeWidth={2} />
  return              <Check     className={`w-3.5 h-3.5 text-[#a0a0a0] ${className}`} strokeWidth={2} />
}

export function SmartTimestamp({ date, className = '' }) {
  try {
    const d = new Date(date)
    let label
    if (isToday(d))     label = format(d, 'HH:mm')
    else if (isYesterday(d)) label = 'Yesterday'
    else                label = format(d, 'dd MMM')
    return <span className={`text-[11px] text-[#a0a0a0] tabular-nums ${className}`}>{label}</span>
  } catch { return null }
}

export function ReconnectToast({ connected }) {
  if (connected) return null
  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#171717] text-white text-xs font-medium shadow-lg">
      <WifiOff className="w-3.5 h-3.5" /> Reconnecting…
    </div>
  )
}

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 select-none text-center px-8">
      <div className="w-12 h-12 rounded-2xl bg-[#f3f3f3] flex items-center justify-center">
        <MessageSquare className="w-5 h-5 text-[#d1d1d1]" />
      </div>
      <div>
        <p className="text-sm font-medium text-[#3a3a3a]">No conversation open</p>
        <p className="text-xs text-[#a0a0a0] mt-1">Select a chat from the sidebar</p>
      </div>
    </div>
  )
}

export function OnlineDot({ online }) {
  return (
    <span
      className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full border-2 border-white ${online ? 'bg-[#16a34a]' : 'bg-[#d1d1d1]'}`}
    />
  )
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2.5 rounded-2xl rounded-bl-sm bg-[#f3f3f3] w-fit">
      {[0, 0.15, 0.3].map((d, i) => (
        <span
          key={i}
          className="block w-1.5 h-1.5 rounded-full bg-[#a0a0a0]"
          style={{ animation: `typingBounce 1.2s ease-in-out ${d}s infinite` }}
        />
      ))}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
