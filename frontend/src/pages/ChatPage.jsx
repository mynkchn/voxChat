import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMe } from '../api/auth'
import { createGroup } from '../api/chat'
import { useChat } from '../hooks/useChat'
import { usePresence } from '../hooks/usePresence'
import { useWebSocket } from '../hooks/useWebSocket'
import { Sidebar } from '../components/layout/Sidebar'
import { ChatWindow } from '../components/layout/ChatWindow'
import { ReconnectToast } from '../components/shared'

export default function ChatPage() {
  const navigate = useNavigate()
  const [me, setMe]               = useState(null)
  const [loading, setLoading]     = useState(true)
  const [connected, setConnected] = useState(true)
  const [isMobile, setIsMobile]   = useState(window.innerWidth < 768)
  const [mobileView, setMobileView] = useState('sidebar')

  const { subscribe }  = useWebSocket()
  const { onlineIds }  = usePresence()
  const {
    conversations, groups, messages, activeConv,
    openConversation, sendMessage, sendTyping, isTyping,
    loadConversations, loadingMessages, loadingConvs
  } = useChat(me)

  useEffect(() => {
    const token = localStorage.getItem('voxchat_token')
    if (!token) { navigate('/login'); return }
    getMe()
      .then(r => setMe(r.data))
      .catch(() => { localStorage.removeItem('voxchat_token'); navigate('/login') })
      .finally(() => setLoading(false))
  }, [navigate])

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  useEffect(() => {
    return subscribe(e => {
      if (e.type === '__connected__')    setConnected(true)
      if (e.type === '__disconnected__') setConnected(false)
    })
  }, [subscribe])

  const handleOpen = conv => { openConversation(conv); setMobileView('chat') }
  const handleLogout = () => { localStorage.removeItem('voxchat_token'); navigate('/login') }
  const handleCreateGroup = async name => {
    try { await createGroup({ name, member_ids: [] }); loadConversations() } catch (_) {}
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex gap-1.5">
          {[0, 0.12, 0.24].map((d, i) => (
            <span key={i} className="w-2 h-2 rounded-full bg-[#d1d1d1]"
              style={{ animation: `bounce 1.2s ease-in-out ${d}s infinite` }} />
          ))}
          <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      <ReconnectToast connected={connected} />

      {/* sidebar */}
      <div className={`shrink-0 ${isMobile ? (mobileView === 'sidebar' ? 'flex w-full' : 'hidden') : 'flex'}`}>
        <Sidebar
          me={me}
          conversations={conversations}
          groups={groups}
          activeConv={activeConv}
          onlineIds={onlineIds}
          onOpen={handleOpen}
          onLogout={handleLogout}
          onCreateGroup={handleCreateGroup}
          loadingConvs={loadingConvs}
        />
      </div>

      {/* chat */}
      <div className={`flex-1 flex flex-col min-w-0 ${isMobile ? (mobileView === 'chat' ? 'flex' : 'hidden') : 'flex'}`}>
        <ChatWindow
          activeConv={activeConv}
          messages={messages}
          me={me}
          onSend={sendMessage}
          onTyping={sendTyping}
          isTyping={isTyping}
          onlineIds={onlineIds}
          onBack={() => setMobileView('sidebar')}
          isMobile={isMobile}
          loadingMessages={loadingMessages}
        />
      </div>
    </div>
  )
}
