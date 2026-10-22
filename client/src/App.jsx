import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import Login from './pages/Login'
import Register from './pages/Register'
import MyVehicles from './pages/MyVehicles'
import SlotGrid from './pages/SlotGrid'
import AdminSlots from './pages/AdminSlots'
import StaffEntry from './pages/StaffEntry'
import StaffExit from './pages/StaffExit'

// Each page lives in its own file under src/pages - edit only your own pages to avoid merge conflicts.
export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/slots" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vehicles" element={<MyVehicles />} />
          <Route path="/slots" element={<SlotGrid />} />
          <Route path="/admin/slots" element={<AdminSlots />} />
          <Route path="/entry" element={<StaffEntry />} />
          <Route path="/exit" element={<StaffExit />} />
          <Route path="*" element={<p>Page not found.</p>} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}
