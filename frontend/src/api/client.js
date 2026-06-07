import axios from 'axios'

const client = axios.create({
  baseURL: 'http://127.0.0.1:5000',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('voxchat_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('voxchat_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
