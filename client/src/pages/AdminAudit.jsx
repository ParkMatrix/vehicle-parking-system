// OWNER: Preksha - #47 VPS-F-017, #48 VPS-SR-005, #49 VPS-NF-006 Admin Audit log page
import { useCallback, useEffect, useState } from 'react'
import api, { errorMessage } from '../api'
import { getUser } from '../auth'
import { useNavigate } from 'react-router-dom'

export default function AdminAudit() {
  const navigate = useNavigate()
  const [user] = useState(getUser)
  const [logs, setLogs] = useState([])
  const [retention, setRetention] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [actionFilter, setActionFilter] = useState('')
  const [resultFilter, setResultFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (actionFilter) params.action = actionFilter
      if (resultFilter) params.result = resultFilter
      if (startDate) params.startDate = new Date(startDate).toISOString()
      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        params.endDate = end.toISOString()
      }

      const res = await api.get('/admin/audit', { params })
      setLogs(res.data.logs || [])
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [actionFilter, resultFilter, startDate, endDate])

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'admin') {
      return
    }

    fetchLogs()

    api
      .get('/admin/audit/retention')
      .then((res) => setRetention(res.data))
      .catch(() => {})
  }, [user, navigate, fetchLogs])

  function resetFilters() {
    setActionFilter('')
    setResultFilter('')
    setStartDate('')
    setEndDate('')
  }

  function formatDetails(details) {
    if (!details) return '—'
    if (typeof details === 'string') return details
    const parts = []
    if (details.email) parts.push(`Email: ${details.email}`)
    if (details.slotId) parts.push(`Slot: ${details.slotId}`)
    if (details.previousStatus && details.newStatus) {
      parts.push(`Status: ${details.previousStatus} -> ${details.newStatus}`)
    }
    if (details.reason) parts.push(`Reason: ${details.reason}`)
    if (parts.length > 0) return parts.join(' | ')
    return JSON.stringify(details)
  }

  if (!user || user.role !== 'admin') {
    return (
      <section>
        <h2>Audit Logs</h2>
        <p className="error">Access denied: Admin role required.</p>
      </section>
    )
  }

  return (
    <section>
      <div className="dash-header">
        <div>
          <h2>Security & System Audit Logs</h2>
          <p className="stat-sub">
            Accountability and audit events for authentication, slot changes, and admin operations.
          </p>
        </div>
        <button onClick={fetchLogs} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {retention && (
        <div
          style={{
            background: '#e0f2fe',
            border: '1px solid #7dd3fc',
            color: '#0369a1',
            borderRadius: '6px',
            padding: '10px 14px',
            margin: '16px 0',
            fontSize: '13px',
          }}
        >
          <strong>Audit Retention Policy:</strong> Logs are retained for a minimum of{' '}
          {retention.minimumRetentionYears} year ({retention.retentionPeriodDays} days /{' '}
          {retention.retentionPeriodSeconds.toLocaleString()} seconds) in accordance with VPS-NF-006.
        </div>
      )}

      {/* Filter bar */}
      <div
        className="card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '16px',
        }}
      >
        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
          Action
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            <option value="">All Actions</option>
            <option value="AUTH_LOGIN">Authentication (Login)</option>
            <option value="SLOT_STATUS_UPDATE">Slot Status Update</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
          Outcome
          <select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)}>
            <option value="">All Results</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
          From Date
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
          To Date
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <button
          onClick={resetFilters}
          style={{ alignSelf: 'flex-end', height: '36px' }}
        >
          Reset Filters
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {loading && <p>Loading audit records…</p>}

      {!loading && logs.length === 0 && (
        <p className="todo">No audit records found matching the current filters.</p>
      )}

      {!loading && logs.length > 0 && (
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Outcome</th>
              <th>Actor</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td>
                  <strong>{log.action}</strong>
                </td>
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      background: log.result === 'success' ? '#dcfce7' : '#fee2e2',
                      color: log.result === 'success' ? '#16a34a' : '#dc2626',
                    }}
                  >
                    {log.result}
                  </span>
                </td>
                <td style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  {log.actorId ? `User #${log.actorId.slice(-6)}` : 'System / Unauth'}
                </td>
                <td style={{ fontSize: '13px' }}>{formatDetails(log.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
