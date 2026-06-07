import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Search, Plus, LogOut, MessageSquare, Users, X } from 'lucide-react'
import { ConversationItem } from './ConversationItem'
import { Avatar, AvatarFallback, Input, Button } from '../ui'
import { searchUsers } from '../../api/auth'

function ConvSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
      <div className="w-9 h-9 rounded-full bg-[#efefef] animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-[#efefef] rounded animate-pulse w-3/4" />
        <div className="h-2.5 bg-[#efefef] rounded animate-pulse w-1/2" />
      </div>
    </div>
  )
}

export function Sidebar({ me, conversations, groups, activeConv, onlineIds, onOpen, onLogout, onCreateGroup, loadingConvs }) {
  const [query, setQuery]       = useState('')
  const [tab, setTab]           = useState('dms')
  const [creating, setCreating] = useState(false)
  const [groupName, setGroupName] = useState('')

  // User search
  const [userResults, setUserResults]     = useState([])
  const [searching, setSearching]         = useState(false)
  const [showDropdown, setShowDropdown]   = useState(false)
  const searchTimer = useRef(null)
  const inputRef = useRef(null)

  const filteredDMs = useMemo(() =>
    conversations.filter(c => c.username?.toLowerCase().includes(query.toLowerCase())),
    [conversations, query]
  )
  const filteredGroups = useMemo(() =>
    groups.filter(g => g.name?.toLowerCase().includes(query.toLowerCase())),
    [groups, query]
  )

  // Debounced user search
  useEffect(() => {
    clearTimeout(searchTimer.current)
    if (!query.trim()) { setUserResults([]); setShowDropdown(false); return }

    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await searchUsers(query.trim())
        // Filter out self
        const users = (res.data || []).filter(u => u.id !== me?.id)
        setUserResults(users)
        setShowDropdown(users.length > 0)
      } catch (_) {
        setUserResults([])
        setShowDropdown(false)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(searchTimer.current)
  }, [query, me])

  const handleOpenUser = useCallback((user) => {
    setQuery('')
    setShowDropdown(false)
    onOpen({ type: 'dm', id: user.id, name: user.username })
  }, [onOpen])

  const handleCreate = () => {
    if (groupName.trim()) { onCreateGroup?.(groupName.trim()); setGroupName(''); setCreating(false) }
  }

  const clearSearch = () => { setQuery(''); setShowDropdown(false); setUserResults([]) }

  return (
    <div className="flex flex-col h-full bg-white border-r border-[#e8e8e8]" style={{ width: 280 }}>

      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#f3f3f3]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#2563eb] flex items-center justify-center">
            <MessageSquare className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-[#171717] tracking-tight text-[15px]">voxChat</span>
        </div>
        <button
          onClick={onLogout}
          className="p-1.5 rounded-lg text-[#a0a0a0] hover:text-[#525252] hover:bg-[#f3f3f3] transition-colors duration-150"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* user row */}
      {me && (
        <div className="flex items-center gap-2.5 mx-3 mt-3 mb-2 px-2.5 py-2 rounded-xl bg-[#f9f9f9]">
          <div className="relative">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[10px]">{me.username?.slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 block w-2 h-2 rounded-full border border-white bg-[#16a34a]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#171717] truncate">{me.username}</p>
            <p className="text-[10px] text-[#16a34a]">Active</p>
          </div>
        </div>
      )}

      {/* search with dropdown */}
      <div className="px-3 mb-3 relative">
        <div className="relative">
          <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors duration-150 ${query ? 'text-[#2563eb]' : 'text-[#a0a0a0]'}`} />
          <Input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => userResults.length > 0 && setShowDropdown(true)}
            placeholder="Search users…"
            className="pl-8 h-8 text-xs bg-[#f9f9f9] border-transparent focus:border-[#2563eb] focus:bg-white transition-colors duration-150"
          />
          {query && (
            <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-[#525252] transition-colors">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* search results dropdown */}
        {(showDropdown || (searching && query)) && (
          <div className="absolute left-3 right-3 top-[calc(100%+4px)] z-50 bg-white border border-[#e8e8e8] rounded-xl shadow-lg overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[#f3f3f3]">
              <p className="text-[10px] text-[#a0a0a0] font-medium uppercase tracking-wide">Users</p>
            </div>
            {searching ? (
              <div className="px-3 py-3 space-y-2">
                {[1,2].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#f0f0f0] animate-pulse shrink-0" />
                    <div className="h-3 bg-[#f0f0f0] rounded animate-pulse flex-1" />
                  </div>
                ))}
              </div>
            ) : userResults.length === 0 ? (
              <p className="text-xs text-[#a0a0a0] text-center py-4">No users found</p>
            ) : (
              <div className="max-h-48 overflow-y-auto">
                {userResults.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleOpenUser(user)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-[#f5f8ff] transition-colors duration-100 text-left"
                  >
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[10px]">{user.username?.slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#171717] truncate">{user.username}</p>
                      {user.email && <p className="text-[10px] text-[#a0a0a0] truncate">{user.email}</p>}
                    </div>
                    <span className="text-[10px] text-[#2563eb] font-medium shrink-0">Message →</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* tabs */}
      <div className="flex items-center gap-1 px-3 mb-2">
        {[{ id: 'dms', label: 'Direct', icon: MessageSquare }, { id: 'groups', label: 'Groups', icon: Users }].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 h-7 rounded-lg text-xs font-medium transition-colors duration-150 ${
              tab === id ? 'bg-[#eff6ff] text-[#2563eb]' : 'text-[#a0a0a0] hover:text-[#525252] hover:bg-[#f5f5f5]'
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* conversation list */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {loadingConvs ? (
          Array.from({ length: 5 }).map((_, i) => <ConvSkeleton key={i} />)
        ) : tab === 'dms' ? (
          filteredDMs.length === 0
            ? (
              <div className="text-center py-10 px-4">
                <p className="text-xs text-[#a0a0a0]">No conversations yet</p>
                <p className="text-[10px] text-[#c0c0c0] mt-1">Search above to find users</p>
              </div>
            )
            : filteredDMs.map(c => (
              <ConversationItem key={c.user_id} conv={c}
                isActive={activeConv?.type === 'dm' && activeConv.id === c.user_id}
                isGroup={false} onlineIds={onlineIds}
                onClick={() => onOpen({ type: 'dm', id: c.user_id, name: c.username })}
              />
            ))
        ) : (
          <>
            {creating && (
              <div className="flex gap-1.5 px-1 py-2">
                <Input value={groupName} onChange={e => setGroupName(e.target.value)}
                  placeholder="Group name" className="h-8 text-xs"
                  onKeyDown={e => e.key === 'Enter' && handleCreate()} autoFocus />
                <Button size="sm" onClick={handleCreate} className="h-8 px-3 text-xs shrink-0">Create</Button>
              </div>
            )}
            {filteredGroups.length === 0
              ? <p className="text-xs text-[#a0a0a0] text-center py-10">No groups yet</p>
              : filteredGroups.map(g => (
                <ConversationItem key={g.id} conv={g}
                  isActive={activeConv?.type === 'group' && activeConv.id === g.id}
                  isGroup={true} onlineIds={onlineIds}
                  onClick={() => onOpen({ type: 'group', id: g.id, name: g.name })}
                />
              ))
            }
          </>
        )}
      </div>

      {/* new group button */}
      {tab === 'groups' && (
        <div className="px-3 py-3 border-t border-[#f3f3f3]">
          <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 transition-colors duration-150" onClick={() => setCreating(v => !v)}>
            <Plus className="w-3.5 h-3.5" /> New Group
          </Button>
        </div>
      )}
    </div>
  )
}
