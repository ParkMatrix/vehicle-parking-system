import { NavLink, useNavigate } from 'react-router-dom'
import { getUser, logout } from '../auth'

export default function NavBar() {
  const user = getUser()
  const navigate = useNavigate()
  const role = user?.role

  return (
    <nav className="nav">
      <strong className="brand">ParkMatrix</strong>
      <NavLink to="/slots">Slots</NavLink>
      {role === 'owner' && <NavLink to="/vehicles">My vehicles</NavLink>}
      {(role === 'staff' || role === 'admin') && <NavLink to="/entry">Entry</NavLink>}
      {(role === 'staff' || role === 'admin') && <NavLink to="/exit">Exit</NavLink>}
      {role === 'admin' && <NavLink to="/admin/slots">Manage slots</NavLink>}
      <span className="spacer" />
      {user ? (
        <button
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Log out ({user.name})
        </button>
      ) : (
        <>
          <NavLink to="/login">Log in</NavLink>
          <NavLink to="/register">Register</NavLink>
        </>
      )}
    </nav>
  )
}
