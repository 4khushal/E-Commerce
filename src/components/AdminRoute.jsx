import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'
import LoadingSpinner from './LoadingSpinner'

const AdminRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth()

  // Show loading while checking admin authentication
  if (loading) {
    return <LoadingSpinner text="Checking admin access..." />
  }

  // Redirect to admin login if not authenticated
  if (!admin) {
    return <Navigate to="/admin/login" replace />
  }

  // Admin is authenticated - allow access
  return children
}

export default AdminRoute

