import { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUser } from './store/slices/authSlice'
import { setTheme } from './store/slices/themeSlice'

// Lazy-loaded pages for code splitting and smaller initial bundle
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const SuperAdminDashboard = lazy(() => import('./pages/super-admin/Dashboard'))
const SuperAdminBusinesses = lazy(() => import('./pages/super-admin/Businesses'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminJobs = lazy(() => import('./pages/admin/Jobs'))
const AdminJobsNew = lazy(() => import('./pages/admin/JobsNew'))
const AdminJobsDetail = lazy(() => import('./pages/admin/JobsDetail'))
const AdminCustomers = lazy(() => import('./pages/admin/Customers'))
const AdminCars = lazy(() => import('./pages/admin/Cars'))
const AdminServices = lazy(() => import('./pages/admin/Services'))
const AdminNotifications = lazy(() => import('./pages/admin/Notifications'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))
const AdminWhatsAppSettings = lazy(() => import('./pages/admin/WhatsAppSettings'))
const AdminMyPlan = lazy(() => import('./pages/admin/MyPlan'))
const AdminHelpSupport = lazy(() => import('./pages/admin/HelpSupport'))
const SuperAdminSupport = lazy(() => import('./pages/super-admin/Support'))
const SuperAdminSettings = lazy(() => import('./pages/super-admin/Settings'))
const SuperAdminSubscriptionPlans = lazy(() => import('./pages/super-admin/SubscriptionPlans'))
const SuperAdminUpgradeRequests = lazy(() => import('./pages/super-admin/UpgradeRequests'))

const SuperAdminLayout = lazy(() => import('./layouts/SuperAdminLayout'))
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]" aria-busy="true">
    <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
  </div>
)

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme) {
      dispatch(setTheme(storedTheme))
    }

    const token = localStorage.getItem('token')
    if (token) {
      dispatch(getCurrentUser())
    }
  }, [dispatch])

  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

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

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
