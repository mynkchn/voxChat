import client from './client'

export const getConversations    = ()         => client.get('/chat/conversations')
export const getMessages         = (userId)   => client.get(`/chat/messages/${userId}`)
export const getUnreadCount      = ()         => client.get('/chat/unread-count')
export const getOnlineUsers      = ()         => client.get('/chat/online-users')
export const createGroup         = (data)     => client.post('/chat/groups', data)
export const getGroups           = ()         => client.get('/chat/groups')
export const getGroupMessages    = (groupId)  => client.get(`/chat/groups/${groupId}/messages`)
export const addGroupMember      = (groupId, userId) => client.post(`/chat/groups/${groupId}/members?user_id=${userId}`)
