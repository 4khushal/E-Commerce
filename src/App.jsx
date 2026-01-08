import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import Footer from './components/Footer'
import AdminRoute from './components/AdminRoute'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load pages for better performance and code splitting
const Home = lazy(() => import('./pages/Home'))
const Products = lazy(() => import('./pages/Products'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Cart = lazy(() => import('./pages/Cart'))
const Checkout = lazy(() => import('./pages/Checkout'))
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'))
const CheckoutCancel = lazy(() => import('./pages/CheckoutCancel'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const Orders = lazy(() => import('./pages/Orders'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/admin/Products'))
const ProductForm = lazy(() => import('./pages/admin/ProductForm'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminCategories = lazy(() => import('./pages/admin/Categories'))

// Public Layout Component
const PublicLayout = () => {
  return (
    <>
      <Header />
      <main className="flex-grow-1">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/cancel" element={<CheckoutCancel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}

// Check if we're running on admin port (3001)
const isAdminPort = () => {
  if (typeof window !== 'undefined') {
    return window.location.port === '3001' || window.location.port === '5174'
  }
  return false
}

function App() {
  const adminPort = isAdminPort()
  
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <CartProvider>
          <div className="App d-flex flex-column min-vh-100">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                {/* Admin Routes - Separate Authentication */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <Suspense fallback={<LoadingSpinner />}>
                        <AdminLayout />
                      </Suspense>
                    </AdminRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<ProductForm />} />
                  <Route path="products/:id/edit" element={<ProductForm />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="categories" element={<AdminCategories />} />
                </Route>

                {/* If on admin port, redirect root to admin login, otherwise show public routes */}
              {adminPort ? (
                <>
                  <Route path="/" element={<Navigate to="/admin/login" replace />} />
                  <Route path="/*" element={<Navigate to="/admin/login" replace />} />
                </>
              ) : (
                <Route path="/*" element={<PublicLayout />} />
              )}
            </Routes>
          </Suspense>
          </div>
        </CartProvider>
      </AdminAuthProvider>
    </AuthProvider>
  )
}

export default App

