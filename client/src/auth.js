// Tiny helper for the logged-in user. Nishant (#25) stores { token, user } here after login.
export function saveSession(token, user) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
