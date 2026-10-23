// OWNER: Nishant - #24 VPS-F-001
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { errorMessage } from '../api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    setBusy(true)
    try {
      const { name, email, phone, password } = form
      await api.post('/auth/register', { name, email, phone, password })
      navigate('/login', { state: { registered: email } })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="card auth">
      <h2>Create account</h2>
      <form onSubmit={submit} className="form">
        <label>
          Name
          <input name="name" value={form.name} onChange={update} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={update} required />
        </label>
        <label>
          Phone (optional)
          <input name="phone" value={form.phone} onChange={update} />
        </label>
        <label>
          Password
          <input name="password" type="password" minLength={6} value={form.password} onChange={update} required />
        </label>
        <label>
          Confirm password
          <input name="confirm" type="password" value={form.confirm} onChange={update} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  )
}
