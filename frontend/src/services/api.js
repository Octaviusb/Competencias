import axios from 'axios'

const base = (import.meta?.env?.VITE_API_URL || 'https://competency-manager.fly.dev').replace(/\/$/, '')
const api = axios.create({
  baseURL: `${base}/api`,
})

api.interceptors.request.use((config) => {
  const url = config.url || ''
  // Do not send auth headers to public endpoints to avoid preflight
  const isPublic = url.startsWith('/public')
  const token = !isPublic && localStorage.getItem('token')
  const orgId = localStorage.getItem('organizationId')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (orgId) config.headers['X-Organization-Id'] = orgId
  return config
})

export default api
