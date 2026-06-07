import { useState, useEffect } from 'react'
import { useWebSocket } from './useWebSocket'
import { getOnlineUsers } from '../api/chat'

export function usePresence() {
  const [onlineIds, setOnlineIds] = useState(new Set())
  const { subscribe } = useWebSocket()

  useEffect(() => {
    getOnlineUsers()
      .then((r) => setOnlineIds(new Set(r.data.online_user_ids)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    return subscribe((event) => {
      if (event.type === 'online') {
        setOnlineIds((prev) => new Set([...prev, event.user_id]))
      } else if (event.type === 'offline') {
        setOnlineIds((prev) => {
          const next = new Set(prev)
          next.delete(event.user_id)
          return next
        })
      }
    })
  }, [subscribe])

  return { onlineIds }
}
