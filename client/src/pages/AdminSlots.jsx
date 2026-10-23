
import { useEffect, useState } from 'react'
import api, { errorMessage } from '../api'

const STATUSES = ['Available', 'Occupied', 'Unavailable']

export default function AdminSlots() {
  const [slots, setSlots] = useState([])
  const [slotId, setSlotId] = useState('')
  const [status, setStatus] = useState('Available')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadSlots() {
    try {
      const response = await api.get('/slots')
      setSlots(response.data)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  useEffect(() => {
    loadSlots()
  }, [])

  async function createSlot(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await api.post('/slots', {
        slotId: slotId.trim(),
        status,
      })

      setSlotId('')
      setStatus('Available')
      setMessage('Parking slot created successfully.')
      await loadSlots()
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Slot ID already exists. Please use a different ID.')
      } else if (err.response?.status === 400) {
        setError(err.response.data?.error || 'Invalid slot details.')
      } else {
        setError(errorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id, newStatus) {
    setError('')
    setMessage('')

    try {
      await api.patch(`/slots/${id}/status`, {
        status: newStatus,
      })

      setMessage('Slot status updated successfully.')
      await loadSlots()
    } catch (err) {
      if (err.response?.status === 409) {
        setError(
          err.response.data?.error ||
          'Cannot update this slot because an active parking session uses it.'
        )
      } else {
        setError(errorMessage(err))
      }

      await loadSlots()
    }
  }

  return (
    <section>
      <h2>Manage parking slots</h2>

      {error && (
        <p role="alert" style={{ color: 'red' }}>
          {error}
        </p>
      )}

      {message && (
        <p role="status" style={{ color: 'green' }}>
          {message}
        </p>
      )}

      <form onSubmit={createSlot}>
        <label htmlFor="slotId">Slot ID</label>
        <input
          id="slotId"
          type="text"
          value={slotId}
          onChange={(event) => setSlotId(event.target.value)}
          placeholder="e.g. A2"
          required
        />

        <label htmlFor="initialStatus">Initial status</label>
        <select
          id="initialStatus"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create slot'}
        </button>
      </form>

      <h3>Existing slots</h3>

      {slots.length === 0 && <p>No parking slots found.</p>}

      <div className="slot-grid">
        {slots.map((slot) => (
          <div className="slot-card" key={slot._id}>
            <h3>{slot.slotId}</h3>
            <p>Current status: {slot.status}</p>

            <label htmlFor={`status-${slot._id}`}>
              Change status
            </label>

            <select
              id={`status-${slot._id}`}
              value={slot.status}
              onChange={(event) =>
                updateStatus(slot._id, event.target.value)
              }
            >
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </section>
  )
}
