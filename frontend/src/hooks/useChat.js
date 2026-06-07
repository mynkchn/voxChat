import { useState, useEffect, useCallback, useRef } from 'react'
import { useWebSocket, sendWS } from './useWebSocket'
import { getConversations, getMessages, getGroups, getGroupMessages } from '../api/chat'

export function useChat(currentUser) {
  const [conversations, setConversations]   = useState([])
  const [groups, setGroups]                 = useState([])
  const [messages, setMessages]             = useState([])
  const [activeConv, setActiveConv]         = useState(null)
  const [typingUsers, setTypingUsers]       = useState({})
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingConvs, setLoadingConvs]     = useState(false)
  const typingTimers  = useRef({})
  const activeConvRef = useRef(null)        // keep ref in sync for ws handler
  const { subscribe } = useWebSocket()

  // Keep ref in sync so the WS subscriber (closed over on mount) always sees latest activeConv
  useEffect(() => { activeConvRef.current = activeConv }, [activeConv])

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true)
    try {
      const [convRes, grpRes] = await Promise.all([getConversations(), getGroups()])
      setConversations(convRes.data || [])
      setGroups(grpRes.data || [])
    } catch (_) {}
    finally { setLoadingConvs(false) }
  }, [])

  useEffect(() => { if (currentUser) loadConversations() }, [loadConversations, currentUser])

  const openConversation = useCallback(async (conv) => {
    setActiveConv(conv)
    setMessages([])
    setLoadingMessages(true)
    try {
      if (conv.type === 'dm') {
        const res = await getMessages(conv.id)
        setMessages(res.data || [])
        const unread = (res.data || [])
          .filter(m => !m.seen && m.sender_id !== currentUser?.id)
          .map(m => m.id)
        if (unread.length) sendWS({ type: 'seen', message_ids: unread })
      } else {
        const res = await getGroupMessages(conv.id)
        setMessages(res.data || [])
      }
    } catch (_) {}
    finally { setLoadingMessages(false) }
  }, [currentUser])

  const sendMessage = useCallback((text) => {
    if (!activeConvRef.current || !text.trim()) return
    const optimistic = {
      id: `opt_${Date.now()}`,
      sender_id: currentUser?.id,
      message: text,
      created_at: new Date().toISOString(),
      delivered: false,
      seen: false,
      _optimistic: true,
    }
    setMessages(prev => [...prev, optimistic])
    if (activeConvRef.current.type === 'dm') {
      sendWS({ type: 'message', receiver_id: activeConvRef.current.id, message: text })
    } else {
      sendWS({ type: 'group_message', group_id: activeConvRef.current.id, message: text })
    }
  }, [currentUser])

  const sendTyping = useCallback(() => {
    if (!activeConvRef.current) return
    if (activeConvRef.current.type === 'dm')
      sendWS({ type: 'typing', receiver_id: activeConvRef.current.id })
    else
      sendWS({ type: 'group_typing', group_id: activeConvRef.current.id })
  }, [])

  useEffect(() => {
    return subscribe((event) => {
      const conv = activeConvRef.current

      // Incoming DM
      if (event.type === 'message') {
        const msg = {
          id: event.message_id,
          sender_id: event.sender_id,
          message: event.message,
          created_at: event.created_at || new Date().toISOString(),
          delivered: true,
          seen: false,
        }
        // Only append if this chat is open
        if (conv?.type === 'dm' && conv.id === event.sender_id) {
          setMessages(prev => [...prev, msg])
          sendWS({ type: 'seen', message_ids: [event.message_id] })
        }
        // Update sidebar last message
        setConversations(prev => prev.map(c =>
          c.user_id === event.sender_id
            ? { ...c, last_message: event.message, last_message_at: event.created_at, unread_count: (conv?.id === event.sender_id ? 0 : (c.unread_count || 0) + 1) }
            : c
        ))
        // If this person is not in conversations yet, reload
        setConversations(prev => {
          const known = prev.some(c => c.user_id === event.sender_id)
          if (!known) { loadConversations(); return prev }
          return prev
        })
      }

      // Delivery confirmation (our optimistic → real)
      if (event.type === 'delivered') {
        setMessages(prev => prev.map(m =>
          m._optimistic ? { ...m, id: event.message_id, delivered: true, _optimistic: false } : m
        ))
      }

      // Seen receipts (our sent messages were seen)
      if (event.type === 'seen') {
        setMessages(prev => prev.map(m =>
          event.message_ids.includes(m.id) ? { ...m, seen: true } : m
        ))
      }

      // Typing
      if (event.type === 'typing') {
        const key = `dm_${event.sender_id}`
        setTypingUsers(prev => ({ ...prev, [key]: true }))
        clearTimeout(typingTimers.current[key])
        typingTimers.current[key] = setTimeout(() =>
          setTypingUsers(prev => { const n = { ...prev }; delete n[key]; return n }), 3000)
      }

      // Incoming group message
      if (event.type === 'group_message') {
        if (conv?.type === 'group' && conv.id === event.group_id) {
          setMessages(prev => [...prev, {
            id: event.message_id,
            sender_id: event.sender_id,
            group_id: event.group_id,
            message: event.message,
            created_at: event.created_at || new Date().toISOString(),
          }])
        }
        setGroups(prev => prev.map(g =>
          g.id === event.group_id
            ? { ...g, last_message: event.message, last_message_at: event.created_at }
            : g
        ))
      }

      // Group message delivered to sender
      if (event.type === 'group_delivered') {
        setMessages(prev => prev.map(m =>
          m._optimistic && m.group_id === event.group_id
            ? { ...m, id: event.message_id, _optimistic: false }
            : m
        ))
      }

      // Group typing
      if (event.type === 'group_typing') {
        const key = `grp_${event.group_id}_${event.sender_id}`
        setTypingUsers(prev => ({ ...prev, [key]: true }))
        clearTimeout(typingTimers.current[key])
        typingTimers.current[key] = setTimeout(() =>
          setTypingUsers(prev => { const n = { ...prev }; delete n[key]; return n }), 3000)
      }
    })
  }, [subscribe, loadConversations])

  const isTyping = activeConv
    ? activeConv.type === 'dm'
      ? !!typingUsers[`dm_${activeConv.id}`]
      : Object.keys(typingUsers).some(k => k.startsWith(`grp_${activeConv.id}_`))
    : false

  return {
    conversations, groups, messages, activeConv,
    openConversation, sendMessage, sendTyping, isTyping,
    loadConversations, loadingMessages, loadingConvs,
  }
}
