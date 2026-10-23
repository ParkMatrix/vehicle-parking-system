// OWNER: Preksha - #28 VPS-F-003, #29 VPS-F-004
import { useEffect, useState } from 'react'
import api, { errorMessage } from '../api'
import { getUser } from '../auth'
import { useNavigate } from 'react-router-dom'

export default function MyVehicles() {
  const navigate = useNavigate()
  const user = getUser()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Register form state
  const [regNumber, setRegNumber] = useState('')
  const [make, setMake] = useState('')
  const [model, setModel] = useState('')
  const [color, setColor] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')

  // Edit state
  const [editId, setEditId] = useState(null)
  const [editFields, setEditFields] = useState({})
  const [editError, setEditError] = useState('')

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    fetchVehicles()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchVehicles() {
    try {
      setLoading(true)
      const res = await api.get('/vehicles')
      setVehicles(res.data.vehicles)
      setError('')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    setSuccess('')
    try {
      await api.post('/vehicles', { registrationNumber: regNumber, make, model, color })
      setSuccess('Vehicle registered!')
      setRegNumber(''); setMake(''); setModel(''); setColor('')
      fetchVehicles()
    } catch (err) {
      setFormError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(v) {
    setEditId(v.id)
    setEditFields({ registrationNumber: v.registrationNumber, make: v.make || '', model: v.model || '', color: v.color || '' })
    setEditError('')
  }

  async function handleUpdate(e) {
    e.preventDefault()
    setEditError('')
    try {
      await api.patch(`/vehicles/${editId}`, editFields)
      setEditId(null)
      fetchVehicles()
    } catch (err) {
      setEditError(errorMessage(err))
    }
  }

  if (!user) return null

  return (
    <section>
      <h2>My Vehicles</h2>

      {/* Register form - only for owners */}
      {user.role === 'owner' && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3>Register a Vehicle</h3>
          <form className="form" onSubmit={handleRegister}>
            <label>
              Registration Number *
              <input value={regNumber} onChange={(e) => setRegNumber(e.target.value)} required placeholder="e.g. KA01AB1234" />
            </label>
            <label>
              Make
              <input value={make} onChange={(e) => setMake(e.target.value)} placeholder="e.g. Honda" />
            </label>
            <label>
              Model
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. City" />
            </label>
            <label>
              Color
              <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g. White" />
            </label>
            {formError && <p className="error">{formError}</p>}
            {success && <p className="success">{success}</p>}
            <button type="submit" className="primary" disabled={submitting}>
              {submitting ? 'Registering…' : 'Register Vehicle'}
            </button>
          </form>
        </div>
      )}

      {/* Vehicle list */}
      {loading && <p>Loading…</p>}
      {error && <p className="error">{error}</p>}
      {!loading && vehicles.length === 0 && <p>No vehicles registered yet.</p>}
      {!loading && vehicles.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #d0d7de', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Reg. Number</th>
              <th style={{ padding: '8px' }}>Make</th>
              <th style={{ padding: '8px' }}>Model</th>
              <th style={{ padding: '8px' }}>Color</th>
              <th style={{ padding: '8px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #d0d7de' }}>
                {editId === v.id ? (
                  <>
                    <td style={{ padding: '8px' }}>
                      <input value={editFields.registrationNumber} onChange={(e) => setEditFields({ ...editFields, registrationNumber: e.target.value })} />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input value={editFields.make} onChange={(e) => setEditFields({ ...editFields, make: e.target.value })} />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input value={editFields.model} onChange={(e) => setEditFields({ ...editFields, model: e.target.value })} />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <input value={editFields.color} onChange={(e) => setEditFields({ ...editFields, color: e.target.value })} />
                    </td>
                    <td style={{ padding: '8px' }}>
                      <button className="primary" onClick={handleUpdate}>Save</button>{' '}
                      <button onClick={() => setEditId(null)}>Cancel</button>
                      {editError && <p className="error">{editError}</p>}
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '8px' }}>{v.registrationNumber}</td>
                    <td style={{ padding: '8px' }}>{v.make || '—'}</td>
                    <td style={{ padding: '8px' }}>{v.model || '—'}</td>
                    <td style={{ padding: '8px' }}>{v.color || '—'}</td>
                    <td style={{ padding: '8px' }}>
                      {(user.role === 'owner' || user.role === 'admin') && (
                        <button onClick={() => startEdit(v)}>Edit</button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
