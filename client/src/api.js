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
  if (err?.response?.data?.error) return err.response.data.error
  if (err?.response?.status === 401) return 'Please log in to continue.'
  if (err?.response?.status === 403) return 'You do not have permission to do that.'
  if (err?.response?.status >= 500) return 'The server had a problem. Please try again.'
  if (err?.request && !err?.response) return 'Cannot reach the server. Check your connection and try again.'
  return err?.message || 'Something went wrong. Please try again.'
}

export default api
