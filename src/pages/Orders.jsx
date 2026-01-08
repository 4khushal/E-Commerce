import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Container, Row, Col, Card, Table, Badge, Alert, Modal, Button, ListGroup } from 'react-bootstrap'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useOrders } from '../hooks/useOrders'
import { getProductsByIds } from '../services/supabase'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatPrice, formatDate, getProductImage } from '../utils/format'
import { showToast } from '../utils/toast'

const Orders = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { orders, loading, error } = useOrders()
  const success = searchParams.get('success')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderProducts, setOrderProducts] = useState({})
  const [loadingProducts, setLoadingProducts] = useState(false)

  if (!user) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          Please <a href="/login">login</a> to view your orders.
        </Alert>
      </Container>
    )
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger',
    }
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>
  }

  const openDetailsModal = async (order) => {
    setSelectedOrder(order)
    setShowDetailsModal(true)
    
    // Fetch product details for all items in this order
    if (order.items && order.items.length > 0) {
      setLoadingProducts(true)
      try {
        // Extract product IDs from order items
        const productIds = order.items
          .map(item => item.id)
          .filter(id => id) // Remove any null/undefined IDs
        
        if (productIds.length > 0) {
          // Fetch products from database
          const products = await getProductsByIds(productIds)
          
          // Create a map of product ID to product data for quick lookup
          const productsMap = {}
          products.forEach(product => {
            productsMap[product.id] = product
          })
          
          setOrderProducts(productsMap)
        }
      } catch (error) {
        console.error('Error fetching product details:', error)
        showToast.warning('Could not load product images')
      } finally {
        setLoadingProducts(false)
      }
    }
  }

  return (
    <>
      <Helmet>
        <title>Orders - Ecommerce Store</title>
        <meta name="description" content="View your order history" />
      </Helmet>

      <Container className="my-5">
        <Row>
          <Col>
            <h1 className="mb-4">My Orders</h1>
          </Col>
        </Row>

        {success && (
          <Alert variant="success" dismissible>
            Order placed successfully! Thank you for your purchase.
          </Alert>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : orders.length === 0 ? (
          <Card>
            <Card.Body className="text-center py-5">
              <p className="text-muted mb-4">You haven't placed any orders yet.</p>
              <a href="/products" className="btn btn-primary">
                Start Shopping
              </a>
            </Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Body>
              <Table responsive>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <a
                          href={`/orders/${order.id}`}
                          className="text-decoration-none"
                        >
                          #{order.id.slice(0, 8)}
                        </a>
                      </td>
                      <td>{formatDate(order.created_at)}</td>
                      <td>
                        <Button
                          variant="link"
                          className="p-0 text-decoration-none"
                          onClick={() => openDetailsModal(order)}
                        >
                          {order.items?.length || 0} item(s)
                          <br />
                          <small className="text-muted">Click to view details</small>
                        </Button>
                      </td>
                      <td>{formatPrice(order.total)}</td>
                      <td>{getStatusBadge(order.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}

        {/* Order Details Modal */}
        <Modal 
          show={showDetailsModal} 
          onHide={() => {
            setShowDetailsModal(false)
            setOrderProducts({}) // Clear product cache when modal closes
          }}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Order Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <div className="mb-4">
                  <h6>Order Information</h6>
                  <Row>
                    <Col md={6}>
                      <p><strong>Order ID:</strong> #{selectedOrder.id.slice(0, 8)}</p>
                      <p><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                      <p><strong>Date:</strong> {formatDate(selectedOrder.created_at)}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Total:</strong> {formatPrice(selectedOrder.total)}</p>
                      <p><strong>Items:</strong> {selectedOrder.items?.length || 0}</p>
                    </Col>
                  </Row>
                </div>

                <div>
                  <h6 className="mb-3">Ordered Products</h6>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <ListGroup>
                      {selectedOrder.items.map((item, index) => {
                        // Get product details from products table (preferred) or fallback to order item data
                        const product = orderProducts[item.id] || null
                        const productImage = product?.image || item.image || item.imageUrl || ''
                        const productName = product?.name || item.name || 'Unknown Product'
                        const productSku = product?.sku || item.sku || null
                        
                        // Use getProductImage helper for proper formatting
                        const displayImage = getProductImage(productImage)
                        
                        // Create SVG placeholder as fallback
                        const svgPlaceholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='
                        
                        return (
                          <ListGroup.Item key={index} className="d-flex align-items-center">
                            <div className="me-3" style={{ minWidth: '60px' }}>
                            {loadingProducts ? (
                              <div
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  backgroundColor: '#f0f0f0',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid #ddd',
                                }}
                              >
                                <small className="text-muted">Loading...</small>
                              </div>
                            ) : (
                              <img
                                src={displayImage}
                                alt={productName}
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  backgroundColor: '#f0f0f0',
                                  border: '1px solid #ddd',
                                }}
                                onError={(e) => {
                                  // Fallback to SVG placeholder if image fails to load
                                  if (e.target.src !== svgPlaceholder) {
                                    e.target.src = svgPlaceholder
                                  }
                                }}
                                loading="lazy"
                              />
                            )}
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{productName}</h6>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                <small className="text-muted">
                                  Quantity: {item.quantity || 1}
                                </small>
                                {productSku && (
                                  <small className="text-muted ms-2">
                                    SKU: {productSku}
                                  </small>
                                )}
                              </div>
                              <div className="text-end">
                                <strong>{formatPrice(item.price || 0)}</strong>
                                {item.quantity > 1 && (
                                  <div>
                                    <small className="text-muted">
                                      Total: {formatPrice((item.price || 0) * (item.quantity || 1))}
                                    </small>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </ListGroup.Item>
                        )
                      })}
                    </ListGroup>
                  ) : (
                    <Alert variant="info">No items found in this order.</Alert>
                  )}
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowDetailsModal(false)
              setOrderProducts({})
            }}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  )
}

export default Orders

