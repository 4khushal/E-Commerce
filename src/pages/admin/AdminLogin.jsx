import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Container, Card, Form, Button, Alert } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { showToast } from '../../utils/toast'

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAdminAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password)
      showToast.success('Admin login successful')
      navigate('/admin')
    } catch (err) {
      const errorMessage = err.message || 'Invalid admin credentials'
      setError(errorMessage)
      showToast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Admin Login - Ecommerce Store</title>
      </Helmet>

      <div className="min-vh-100 d-flex align-items-center bg-light">
        <Container className="py-5">
          <div className="row justify-content-center">
            <div className="col-md-5 col-lg-4">
              <Card className="shadow">
                <Card.Body className="p-5">
                  <div className="text-center mb-4">
                    <h2 className="fw-bold">Admin Login</h2>
                    <p className="text-muted">Access the admin dashboard</p>
                    <p className="text-muted">Email: admin@gmail.com <br />
                    Password: admin123</p>
                  </div>

                  {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                      {error}
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Admin Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="admin@example.com"
                        required
                        autoFocus
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                      />
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Logging in...' : 'Login to Admin Dashboard'}
                    </Button>

                    <div className="text-center">
                      <a href="/" className="text-muted text-decoration-none">
                        ← Back to Store
                      </a>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              <div className="text-center mt-4">
                <p className="text-muted small">
                  Admin access only. Regular users should use the{' '}
                  <a href="/login">customer login</a>.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}

export default AdminLogin

