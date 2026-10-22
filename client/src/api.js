import axios from 'axios'

// Shared API client: every request goes to /api and carries the JWT if the user is logged in.
const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Readable error text for forms (VPS-NF-005)
export function errorMessage(err) {
  return err?.response?.data?.error || err.message || 'Something went wrong'
}

export default api
