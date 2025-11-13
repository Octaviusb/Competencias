import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://competency-manager.fly.dev/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const orgId = localStorage.getItem('organizationId')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (orgId) config.headers['X-Organization-Id'] = orgId
  return config
})

export default api
