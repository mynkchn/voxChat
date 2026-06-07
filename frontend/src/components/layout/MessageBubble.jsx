import React from 'react'
import { SeenTicks, SmartTimestamp } from '../shared'

export function MessageBubble({ message, isMine }) {
  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`
        max-w-[68%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed
        ${isMine
          ? 'bg-[#2563eb] text-white rounded-br-[4px]'
          : 'bg-[#f3f3f3] text-[#171717] rounded-bl-[4px]'
        }
      `}>
        <p className="break-words whitespace-pre-wrap">{message.message}</p>
        <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
          <SmartTimestamp date={message.created_at} className={isMine ? '!text-blue-200' : ''} />
          {isMine && <SeenTicks delivered={message.delivered} seen={message.seen} className={message.seen ? '' : '!text-blue-200'} />}
        </div>
      </div>
    </div>
  )
}
