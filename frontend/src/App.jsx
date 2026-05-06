import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import InventoryPage from './pages/InventoryPage.jsx'
import BookingsPage from './pages/BookingsPage.jsx'
import LoansPage from './pages/LoansPage.jsx'
import TestDrivesPage from './pages/TestDrivesPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="loans" element={<LoansPage />} />
          <Route path="test-drives" element={<TestDrivesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
