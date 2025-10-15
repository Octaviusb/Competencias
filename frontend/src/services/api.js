import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const orgId = localStorage.getItem('organizationId')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (orgId) config.headers['X-Organization-Id'] = orgId
  return config
})

export default api
