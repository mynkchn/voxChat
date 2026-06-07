import client from './client'

export const signup      = (data) => client.post('/auth/signup', data)
export const login       = (data) => client.post('/auth/login', data)
export const getMe       = ()     => client.get('/auth/me')
export const searchUsers = (q)    => client.get(`/auth/users/search?q=${encodeURIComponent(q)}`)
