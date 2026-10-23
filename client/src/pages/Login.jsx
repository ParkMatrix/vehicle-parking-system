// OWNER: Nishant - #25 VPS-F-002
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../api'
import { saveSession } from '../auth'

// Where each role lands after logging in
const HOME_BY_ROLE = { owner: '/vehicles', staff: '/entry', admin: '/admin/slots' }

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const registered = location.state?.registered
  const [form, setForm] = useState({ email: registered || '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { data } = await api.post('/auth/login', form)
      saveSession(data.token, data.user)
      navigate(HOME_BY_ROLE[data.user.role] || '/slots')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card auth">
      <h2>Log in</h2>
      {registered && <p className="success">Account created. Log in to continue.</p>}
      <form onSubmit={submit} className="form">
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={update} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={update} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </section>
  )
}
