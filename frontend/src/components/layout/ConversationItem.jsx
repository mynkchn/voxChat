import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui'
import { SmartTimestamp, OnlineDot } from '../shared'
import { Users } from 'lucide-react'

export function ConversationItem({ conv, isActive, isGroup, onlineIds, onClick }) {
  const name    = isGroup ? conv.name : conv.username
  const unread  = conv.unread_count || 0
  const online  = !isGroup && onlineIds?.has(conv.user_id)
  const initials = name?.slice(0, 2).toUpperCase() || '??'

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left
        transition-all duration-150 active:scale-[0.98]
        ${isActive ? 'bg-[#eff6ff]' : 'hover:bg-[#f9f9f9]'}
      `}
    >
      {/* avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-9 w-9">
          {!isGroup && conv.profile_picture && <AvatarImage src={conv.profile_picture} />}
          <AvatarFallback className={isGroup ? 'bg-[#ede9fe] text-[#7c3aed] text-[11px]' : 'text-[11px]'}>
            {isGroup ? <Users className="w-3.5 h-3.5" /> : initials}
          </AvatarFallback>
        </Avatar>
        {!isGroup && <OnlineDot online={online} />}
      </div>

      {/* text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm truncate ${isActive ? 'font-semibold text-[#2563eb]' : 'font-medium text-[#171717]'}`}>
            {name}
          </span>
          {conv.last_message_at && <SmartTimestamp date={conv.last_message_at} />}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#a0a0a0] truncate">
            {conv.last_message || (isGroup ? 'Group' : 'No messages yet')}
          </span>
          {unread > 0 && (
            <span className="ml-2 shrink-0 min-w-[18px] h-[18px] rounded-full bg-[#2563eb] text-white text-[10px] font-semibold flex items-center justify-center px-1">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
