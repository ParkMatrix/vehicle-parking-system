
import { useCallback, useEffect, useState } from 'react'
import api, { errorMessage } from '../api'

// OWNER: Salasha - #34 VPS-F-008, #35 VPS-F-009, #36 VPS-F-010
export default function StaffEntry() {
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadAvailableSlots = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await api.get('/slots', {
        params: { status: 'Available' },
      })

      const data = response.data
      const availableSlots = Array.isArray(data)
        ? data
        : data.slots || data.data || []

      const available = availableSlots.filter(
        (slot) => slot.status === 'Available'
      )

      setSlots(available)

      // Clear selection if that slot is no longer available.
      setSelectedSlot((current) =>
        available.some((slot) => slot._id === current) ? current : ''
      )
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAvailableSlots()
  }, [loadAvailableSlots])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    const registration = registrationNumber.trim().toUpperCase()

    if (!registration || !selectedSlot) {
      setError('Enter a registration number and select an available slot.')
      return
    }

    try {
      setSubmitting(true)

      const response = await api.post('/parking/entry', {
        registrationNumber: registration,
        slotId: selectedSlot,
      })

      setMessage(response.data.message || 'Vehicle entry recorded successfully.')
      setRegistrationNumber('')
      setSelectedSlot('')
      await loadAvailableSlots()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h2>Record vehicle entry</h2>
      <p>Enter the vehicle registration number and select an available slot.</p>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Registration number
          <input
            type="text"
            value={registrationNumber}
            onChange={(event) => setRegistrationNumber(event.target.value)}
            placeholder="e.g. KA01AB1234"
            required
          />
        </label>

        <label>
          Available slot
          <select
            value={selectedSlot}
            onChange={(event) => setSelectedSlot(event.target.value)}
            disabled={loading || slots.length === 0}
            required
          >
            <option value="">
              {loading ? 'Loading slots...' : 'Choose a slot'}
            </option>
            {slots.map((slot) => (
              <option key={slot._id} value={slot._id}>
                {slot.slotId}
              </option>
            ))}
          </select>
        </label>

        {!loading && !error && slots.length === 0 && (
          <p>No available parking slots.</p>
        )}

        <button type="submit" disabled={loading || submitting || slots.length === 0}>
          {submitting ? 'Recording entry...' : 'Record entry'}
        </button>
      </form>

      <button type="button" onClick={loadAvailableSlots} disabled={loading}>
        Refresh available slots
      </button>
    </section>
  )
}
