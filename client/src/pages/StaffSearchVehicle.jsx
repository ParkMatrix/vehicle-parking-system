import { useState } from 'react'
import api, { errorMessage } from '../api'

export default function StaffSearchVehicle() {
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [vehicleData, setVehicleData] = useState(null)
  const [currentSlot, setCurrentSlot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(event) {
    event.preventDefault()

    const registration = registrationNumber.trim().toUpperCase()

    if (!registration) {
      setError('Please enter a registration number.')
      return
    }

    setLoading(true)
    setError('')
    setVehicleData(null)
    setCurrentSlot(null)

    try {
      const response = await api.get(
        `/parking/active/${encodeURIComponent(registration)}`
      )

      const data = response.data

      if (!data.session?.vehicleId) {
        throw new Error('Vehicle session information is unavailable.')
      }

      const slotResponse = await api.get(
        `/vehicles/${data.session.vehicleId}/current-slot`
      )

      setVehicleData(data)
      setCurrentSlot(slotResponse.data.currentSlot)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <h2>Search Vehicle</h2>
      <p>Search for a vehicle to view its active parking session and current slot.</p>

      <form onSubmit={handleSearch}>
        <label htmlFor="registrationNumber">
          Vehicle Registration Number
        </label>

        <input
          id="registrationNumber"
          type="text"
          value={registrationNumber}
          onChange={(event) =>
            setRegistrationNumber(event.target.value.toUpperCase())
          }
          placeholder="e.g. KA01AB1234"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search Vehicle'}
        </button>
      </form>

      {error && <p role="alert" style={{ color: 'red' }}>{error}</p>}

      {vehicleData && (
        <div>
          <h3>Vehicle Details</h3>

          <p>
            <strong>Registration Number:</strong>{' '}
            {vehicleData.vehicle.registrationNumber}
          </p>

          <p>
            <strong>Parking Status:</strong>{' '}
            {vehicleData.session.status}
          </p>

          <p>
            <strong>Entry Time:</strong>{' '}
            {currentSlot?.entryTime
              ? new Date(currentSlot.entryTime).toLocaleString()
              : 'Not available'}
          </p>

          <h3>Current Parking Slot</h3>

          <p>
            <strong>Slot ID:</strong>{' '}
            {currentSlot?.slot?.slotId || 'Not available'}
          </p>

          <p>
            <strong>Slot Status:</strong>{' '}
            {currentSlot?.slot?.status || 'Not available'}
          </p>
        </div>
      )}
    </section>
  )
}
