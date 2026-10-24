
import { useState } from 'react'
import api, { errorMessage } from '../api'

// OWNER: Salasha - #38 VPS-F-013, #39 VPS-F-014
export default function StaffExit() {
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    const registration = registrationNumber.trim().toUpperCase()

    if (!registration) {
      setError('Please enter the vehicle registration number.')
      return
    }

    try {
      setSubmitting(true)

      const response = await api.post('/parking/exit', {
        registrationNumber: registration,
      })

      setMessage(
        response.data.message || 'Vehicle exit recorded successfully. The parking slot is now available.'
      )
      setRegistrationNumber('')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h2>Record vehicle exit</h2>
      <p>Enter the registration number of the departing vehicle.</p>

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

        <button type="submit" disabled={submitting}>
          {submitting ? 'Recording exit...' : 'Record exit'}
        </button>
      </form>
    </section>
  )
}
