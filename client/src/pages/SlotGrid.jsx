
import { useEffect, useState } from 'react'
import api, { errorMessage } from '../api'

export default function SlotGrid() {
  const [slots, setSlots] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/slots')
      .then((response) => setSlots(response.data))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <h2>Parking slots</h2>

      {loading && <p>Loading slots...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && !error && slots.length === 0 && (
        <p>No parking slots found.</p>
      )}

      <div className="slot-grid">
        {slots.map((slot) => (
          <div
            key={slot._id}
            className={`slot-card ${slot.status.toLowerCase()}`}
          >
            <h3>{slot.slotId}</h3>
            <p>{slot.status}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
