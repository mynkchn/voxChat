import React, { useRef, useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Send, ArrowLeft, Users, MoreHorizontal } from 'lucide-react'
import { MessageBubble } from './MessageBubble'
import { EmptyState, TypingIndicator, OnlineDot } from '../shared'
import { Avatar, AvatarFallback } from '../ui'

// Deterministic widths per index so no random flicker on re-render
const SKELETON_WIDTHS = ['w-28', 'w-44', 'w-20', 'w-36', 'w-32', 'w-48', 'w-24', 'w-40']

function MessagesSkeleton() {
  const pattern = [false, true, false, false, true, true, false, true]
  return (
    <div className="flex flex-col gap-2 px-4 py-4">
      {pattern.map((isMine, i) => (
        <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
          <div className={`h-9 rounded-2xl bg-[#efefef] animate-pulse ${SKELETON_WIDTHS[i]}`}
            style={{ animationDelay: `${i * 40}ms` }} />
        </div>
      ))}
    </div>
  )
}

export function ChatWindow({ activeConv, messages, me, onSend, onTyping, isTyping, onlineIds, onBack, isMobile, loadingMessages }) {
  const [text, setText]               = useState('')
  const [userScrolled, setUserScrolled] = useState(false)
  const bottomRef  = useRef(null)
  const scrollRef  = useRef(null)
  const typingTimer = useRef(null)

  // Scroll to bottom when messages arrive (not when user has scrolled up)
  useEffect(() => {
    if (!userScrolled && !loadingMessages) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, userScrolled, loadingMessages])

  // Reset scroll state on conversation switch
  useEffect(() => { setUserScrolled(false); setText('') }, [activeConv?.id])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setUserScrolled(el.scrollHeight - el.scrollTop - el.clientHeight > 80)
  }, [])

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text)
    setText('')
    setUserScrolled(false)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleChange = e => {
    setText(e.target.value)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(onTyping, 300)
  }

  if (!activeConv) return (
    <div className="flex-1 bg-white flex items-center justify-center">
      <EmptyState />
    </div>
  )

  const isGroup  = activeConv.type === 'group'
  const isOnline = !isGroup && onlineIds?.has(activeConv.id)
  const initials = activeConv.name?.slice(0, 2).toUpperCase() || '??'

  return (
    <div className="flex-1 flex flex-col bg-white min-w-0">

      {/* header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#f3f3f3] shrink-0">
        {isMobile && (
          <button onClick={onBack} className="p-1 text-[#a0a0a0] hover:text-[#525252] mr-1 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="relative shrink-0">
          <Avatar className="h-8 w-8">
            <AvatarFallback className={`text-[10px] ${isGroup ? 'bg-[#ede9fe] text-[#7c3aed]' : ''}`}>
              {isGroup ? <Users className="w-3.5 h-3.5" /> : initials}
            </AvatarFallback>
          </Avatar>
          {!isGroup && <OnlineDot online={isOnline} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#171717] truncate">{activeConv.name}</p>
          <p className="text-[11px] text-[#a0a0a0]">
            {isGroup ? 'Group chat' : isOnline ? 'Online' : 'Offline'}
          </p>
        </div>
        <button className="p-1.5 rounded-lg text-[#a0a0a0] hover:bg-[#f3f3f3] hover:text-[#525252] transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* messages area */}
      {loadingMessages ? (
        <div className="flex-1 overflow-hidden">
          <MessagesSkeleton />
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 py-4"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-10 h-10 rounded-2xl bg-[#f3f3f3] flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg">👋</span>
                </div>
                <p className="text-xs font-medium text-[#3a3a3a]">Start the conversation</p>
                <p className="text-[11px] text-[#a0a0a0] mt-0.5">Say hi to {activeConv.name}</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, i) => (
                <motion.div
                  key={m.id || i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  <MessageBubble message={m} isMine={m.sender_id === me?.id} />
                </motion.div>
              ))}
            </>
          )}

          <AnimatePresence>
            {isTyping && (
              <motion.div key="typing"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex justify-start mt-1 mb-1"
              >
                <TypingIndicator />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      )}

      {/* input */}
      <div className="px-4 py-3 border-t border-[#f3f3f3] shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 border border-[#e8e8e8] rounded-2xl px-4 py-2.5 focus-within:border-[#2563eb] transition-colors duration-150 bg-white">
            <textarea
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${activeConv.name}…`}
              rows={1}
              className="w-full resize-none bg-transparent text-sm text-[#171717] placeholder:text-[#a0a0a0] outline-none leading-relaxed max-h-32"
              style={{ overflowY: text.split('\n').length > 3 ? 'auto' : 'hidden' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="shrink-0 w-9 h-9 rounded-xl bg-[#2563eb] flex items-center justify-center text-white hover:bg-[#1d4ed8] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
