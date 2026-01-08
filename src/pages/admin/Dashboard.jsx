import { Helmet } from 'react-helmet-async'
import { Container, Row, Col, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../services/supabase'
import { formatPrice } from '../../utils/format'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get product count
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })

        // Get order stats
        const { data: orders } = await supabase
          .from('orders')
          .select('total, status')

        const totalOrders = orders?.length || 0
        const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0
        const totalRevenue = orders
          ?.filter(o => o.status === 'confirmed' || o.status === 'completed')
          .reduce((sum, o) => sum + parseFloat(o.total || 0), 0) || 0

        setStats({
          totalProducts: productCount || 0,
          totalOrders,
          pendingOrders,
          totalRevenue,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: '📦',
      color: 'primary',
      link: '/admin/products',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: '🛒',
      color: 'info',
      link: '/admin/orders',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: '⏳',
      color: 'warning',
      link: '/admin/orders?status=pending',
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: '💰',
      color: 'success',
      link: '/admin/orders',
    },
  ]

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Ecommerce Store</title>
      </Helmet>

      <Container className="my-4">
        <h1 className="mb-4">Admin Dashboard</h1>

        <Row className="g-4 mb-4">
          {statCards.map((stat, index) => (
            <Col key={index} xs={12} sm={6} lg={3}>
              <Card
                as={Link}
                to={stat.link}
                className={`text-decoration-none h-100 border-${stat.color} shadow-sm`}
                style={{ transition: 'transform 0.2s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <p className="text-muted mb-1 small">{stat.title}</p>
                      <h3 className={`text-${stat.color} mb-0`}>{stat.value}</h3>
                    </div>
                    <div className="fs-1">{stat.icon}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row>
          <Col>
            <Card>
              <Card.Body>
                <h5 className="mb-3">Quick Actions</h5>
                <div className="d-flex flex-wrap gap-2">
                  <Link to="/admin/products/new" className="btn btn-primary">
                    ➕ Add New Product
                  </Link>
                  <Link to="/admin/products" className="btn btn-outline-primary">
                    📦 Manage Products
                  </Link>
                  <Link to="/admin/orders" className="btn btn-outline-info">
                    🛒 View Orders
                  </Link>
                  <Link to="/admin/categories" className="btn btn-outline-secondary">
                    🏷️ Manage Categories
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Dashboard

