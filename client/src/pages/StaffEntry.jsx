
import { useEffect, useState } from 'react'
import api, { errorMessage } from '../api'

// OWNER: Salasha - #34 VPS-F-008
export default function StaffEntry() {
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadAvailableSlots() {
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

        if (!cancelled) {
          setSlots(
            availableSlots.filter((slot) => slot.status === 'Available')
          )
        }
      } catch (err) {
        if (!cancelled) {
          setError(errorMessage(err))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadAvailableSlots()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section>
      <h2>Record vehicle entry</h2>
      <p>Select an available parking slot for the arriving vehicle.</p>

      {loading && <p>Loading available slots...</p>}

      {error && <p role="alert">{error}</p>}

      {!loading && !error && slots.length === 0 && (
        <p>No available parking slots.</p>
      )}

      {!loading && !error && slots.length > 0 && (
        <label>
          Available slot
          <select
            value={selectedSlot}
            onChange={(event) => setSelectedSlot(event.target.value)}
          >
            <option value="">Choose a slot</option>
            {slots.map((slot) => (
              <option key={slot._id || slot.slotId} value={slot._id || slot.slotId}>
                {slot.slotId}
              </option>
            ))}
          </select>
        </label>
      )}

      {selectedSlot && <p>Selected slot: {slots.find(
        (slot) => (slot._id || slot.slotId) === selectedSlot
      )?.slotId}</p>}
    </section>
  )
}
