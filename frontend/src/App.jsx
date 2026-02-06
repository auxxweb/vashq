import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'
import { setTheme } from './store/slices/themeSlice'

// Pages
import LoginPage from './pages/auth/LoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import SuperAdminDashboard from './pages/super-admin/Dashboard'
import SuperAdminBusinesses from './pages/super-admin/Businesses'
import AdminDashboard from './pages/admin/Dashboard'
import AdminJobs from './pages/admin/Jobs'
import AdminJobsNew from './pages/admin/JobsNew'
import AdminJobsDetail from './pages/admin/JobsDetail'
import AdminCustomers from './pages/admin/Customers'
import AdminCars from './pages/admin/Cars'
import AdminServices from './pages/admin/Services'
import AdminNotifications from './pages/admin/Notifications'
import AdminSettings from './pages/admin/Settings'
import AdminWhatsAppSettings from './pages/admin/WhatsAppSettings'
import AdminMyPlan from './pages/admin/MyPlan'
import AdminHelpSupport from './pages/admin/HelpSupport'
import SuperAdminSupport from './pages/super-admin/Support'
import SuperAdminSettings from './pages/super-admin/Settings'
import SuperAdminSubscriptionPlans from './pages/super-admin/SubscriptionPlans'
import SuperAdminUpgradeRequests from './pages/super-admin/UpgradeRequests'

// Layouts
import SuperAdminLayout from './layouts/SuperAdminLayout'
import AdminLayout from './layouts/AdminLayout'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === 'SUPER_ADMIN' ? '/super-admin' : '/admin'} replace />
  }

  return children
}

function App() {
  const dispatch = useDispatch()
  const { theme } = useSelector((state) => state.theme)

  useEffect(() => {
    // Initialize theme
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme) {
      dispatch(setTheme(storedTheme))
    }

    // Try to get current user if token exists
    const token = localStorage.getItem('token')
    if (token) {
      dispatch(getCurrentUser())
    }
  }, [dispatch])

  useEffect(() => {
    // Light theme only (Ontrack-style design)
    document.documentElement.classList.remove('dark')
  }, [])

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Super Admin Routes */}
      <Route
        path="/super-admin/*"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SuperAdminDashboard />} />
        <Route path="businesses" element={<SuperAdminBusinesses />} />
        <Route path="subscription-plans" element={<SuperAdminSubscriptionPlans />} />
        <Route path="upgrade-requests" element={<SuperAdminUpgradeRequests />} />
        <Route path="support" element={<SuperAdminSupport />} />
        <Route path="settings" element={<SuperAdminSettings />} />
      </Route>

      {/* Car Wash Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['CAR_WASH_ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="jobs" element={<AdminJobs />} />
        <Route path="jobs/new" element={<AdminJobsNew />} />
        <Route path="jobs/:id" element={<AdminJobsDetail />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="cars" element={<AdminCars />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="my-plan" element={<AdminMyPlan />} />
        <Route path="whatsapp-settings" element={<AdminWhatsAppSettings />} />
        <Route path="help-support" element={<AdminHelpSupport />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
