import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import InventoryPage from './pages/InventoryPage.jsx'
import BookingsPage from './pages/BookingsPage.jsx'
import LoansPage from './pages/LoansPage.jsx'
import TestDrivesPage from './pages/TestDrivesPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DealerDashboardPage from './pages/DealerDashboardPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route
              path="dealer-dashboard"
              element={
                <ProtectedRoute roles={['dealer']}>
                  <DealerDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin-dashboard"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="loans" element={<LoansPage />} />
            <Route path="test-drives" element={<TestDrivesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
