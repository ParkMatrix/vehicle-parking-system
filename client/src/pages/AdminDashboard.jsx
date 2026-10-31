// OWNER: Nishant - #50 VPS-F-016 Admin occupancy dashboard
import { useCallback, useEffect, useState } from 'react'
import api, { errorMessage } from '../api'

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/admin/occupancy')
      setData(data)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <section>
      <div className="dash-header">
        <h2>Occupancy dashboard</h2>
        <button onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {data && (
        <>
          <div className="stat-row">
            <div className="stat">
              <span className="stat-label">Occupancy</span>
              <span className="stat-value">{data.occupancyRate}%</span>
              <span className="stat-sub">
                {data.occupied} of {data.available + data.occupied} usable slots
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Total slots</span>
              <span className="stat-value">{data.totalSlots}</span>
            </div>
            <div className="stat available">
              <span className="stat-label">Available</span>
              <span className="stat-value">{data.available}</span>
            </div>
            <div className="stat occupied">
              <span className="stat-label">Occupied</span>
              <span className="stat-value">{data.occupied}</span>
            </div>
            <div className="stat unavailable">
              <span className="stat-label">Unavailable</span>
              <span className="stat-value">{data.unavailable}</span>
            </div>
          </div>

          <h3>Vehicles parked now ({data.activeVehicleCount})</h3>
          {data.activeVehicles.length === 0 ? (
            <p className="todo">No vehicles are parked right now.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Details</th>
                  <th>Slot</th>
                  <th>Entry time</th>
                  <th>Parked for</th>
                </tr>
              </thead>
              <tbody>
                {data.activeVehicles.map((v) => (
                  <tr key={v.sessionId}>
                    <td>
                      <strong>{v.registrationNumber}</strong>
                    </td>
                    <td>{v.vehicleDetails || '—'}</td>
                    <td>{v.slotId}</td>
                    <td>{new Date(v.entryTime).toLocaleString()}</td>
                    <td>{formatDuration(v.durationMinutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="stat-sub">Updated {new Date(data.generatedAt).toLocaleTimeString()}</p>
        </>
      )}
    </section>
  )
}
