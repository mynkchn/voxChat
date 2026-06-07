import { useEffect, useRef, useCallback } from 'react'

const WS_BASE = 'ws://127.0.0.1:5000/ws'
let wsInstance = null
let listeners = new Set()
let reconnectTimer = null
let retryDelay = 1000

function notifyListeners(event) {
  listeners.forEach((fn) => fn(event))
}

function connect(token) {
  if (wsInstance && wsInstance.readyState <= 1) return
  wsInstance = new WebSocket(`${WS_BASE}?token=${token}`)

  wsInstance.onopen = () => {
    retryDelay = 1000
    notifyListeners({ type: '__connected__' })
    wsInstance.send(JSON.stringify({ type: 'online' }))
  }

  wsInstance.onmessage = (e) => {
    try {
      notifyListeners(JSON.parse(e.data))
    } catch (_) {}
  }

  wsInstance.onclose = () => {
    notifyListeners({ type: '__disconnected__' })
    reconnectTimer = setTimeout(() => {
      retryDelay = Math.min(retryDelay * 2, 30000)
      connect(token)
    }, retryDelay)
  }

  wsInstance.onerror = () => wsInstance.close()
}

export function sendWS(payload) {
  if (wsInstance?.readyState === 1) {
    wsInstance.send(JSON.stringify(payload))
  }
}

export function useWebSocket() {
  const handler = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('voxchat_token')
    if (!token) return
    connect(token)

    const onUnload = () => sendWS({ type: 'offline' })
    window.addEventListener('beforeunload', onUnload)

    return () => {
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [])

  const subscribe = useCallback((fn) => {
    handler.current = fn
    listeners.add(fn)
    return () => listeners.delete(fn)
  }, [])

  return { subscribe, send: sendWS }
}
