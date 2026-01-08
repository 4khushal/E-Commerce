import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  Container,
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Alert,
  ListGroup,
  Row,
  Col,
} from 'react-bootstrap'
import { getAllOrders, updateOrderStatus, getProductsByIds } from '../../services/supabase'
import { formatPrice, formatDate, getProductImage } from '../../utils/format'
import { showToast } from '../../utils/toast'
import { sendOrderNotification } from '../../services/notifications'
import { TableSkeleton } from '../../components/SkeletonLoader'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderProducts, setOrderProducts] = useState({}) // Store product details by product ID
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await getAllOrders()
      console.log('Loaded orders:', data) // Debug log
      setOrders(data || [])
    } catch (error) {
      console.error('Error loading orders:', error)
      showToast.error(`Failed to load orders: ${error.message || 'Unknown error'}`)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedOrder || !newStatus) return

    try {
      await updateOrderStatus(selectedOrder.id, newStatus)
      
      // Send notification if order is confirmed
      if (newStatus === 'confirmed') {
        const phoneNumber = selectedOrder.shipping_address?.phone || 
                           selectedOrder.customer_phone ||
                           null
        
        if (phoneNumber) {
          try {
            const result = await sendOrderNotification(
              phoneNumber,
              selectedOrder.id
            )
            
            if (result.success) {
              showToast.success('Order confirmed and notification sent!')
            } else {
              showToast.warning('Order confirmed but notification failed')
            }
          } catch (notifError) {
            console.error('Notification error:', notifError)
            showToast.warning('Order confirmed but notification failed: ' + notifError.message)
            // Don't fail the order update if notification fails
          }
        } else {
          console.warn('No phone number found for order notification')
          showToast.warning('Order confirmed but no phone number available for notification')
        }
      }

      showToast.success('Order status updated successfully')
      setShowStatusModal(false)
      setSelectedOrder(null)
      setNewStatus('')
      loadOrders()
    } catch (error) {
      showToast.error('Failed to update order status')
      console.error(error)
    }
  }

  const openStatusModal = (order, status) => {
    setSelectedOrder(order)
    setNewStatus(status)
    setShowStatusModal(true)
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

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'success',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger',
    }
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>
  }

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === filterStatus)

  return (
    <>
      <Helmet>
        <title>Manage Orders - Admin</title>
      </Helmet>

      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Manage Orders</h2>
          <Form.Select
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Form.Select>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : filteredOrders.length === 0 ? (
          <Alert variant="info">
            <Alert.Heading>No Orders Found</Alert.Heading>
            <p>
              {orders.length === 0
                ? "There are no orders in the system yet. Orders will appear here once customers place them through the checkout process."
                : `No orders match the filter "${filterStatus}". Try selecting "All Orders".`}
            </p>
            {orders.length > 0 && (
              <p className="mb-0">
                <strong>Total orders:</strong> {orders.length}
              </p>
            )}
            {orders.length === 0 && (
              <div className="mt-3">
                <p className="small text-muted mb-2">
                  <strong>To test orders:</strong>
                </p>
                <ol className="small text-muted">
                  <li>Go to the user dashboard (port 3000)</li>
                  <li>Add products to cart</li>
                  <li>Complete checkout</li>
                  <li>Orders will appear here</li>
                </ol>
              </div>
            )}
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <small className="text-muted">
                        {order.id.substring(0, 8)}...
                      </small>
                    </td>
                    <td>
                      <div>
                        <strong>
                          {order.customer_name || 
                           (order.shipping_address?.firstName && order.shipping_address?.lastName
                             ? `${order.shipping_address.firstName} ${order.shipping_address.lastName}`
                             : (order.shipping_address?.fn && order.shipping_address?.ln
                               ? `${order.shipping_address.fn} ${order.shipping_address.ln}`
                               : 'Unknown Customer'))}
                        </strong>
                        <br />
                        <small className="text-muted">
                          {order.shipping_address?.email || order.shipping_address?.e || 'No email'}
                        </small>
                        <br />
                        <small className="text-muted">
                          Phone: {order.customer_phone || order.shipping_address?.phone || order.shipping_address?.p || 'N/A'}
                        </small>
                      </div>
                    </td>
                    <td>
                      <Button
                        variant="link"
                        className="p-0 text-decoration-none"
                        onClick={() => openDetailsModal(order)}
                      >
                        {order.items?.length || 0} items
                        <br />
                        <small className="text-muted">Click to view details</small>
                      </Button>
                    </td>
                    <td>{formatPrice(order.total)}</td>
                    <td>{getStatusBadge(order.status)}</td>
                    <td>{formatDate(order.created_at)}</td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        {order.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => openStatusModal(order, 'confirmed')}
                            >
                              ✓ Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => openStatusModal(order, 'cancelled')}
                            >
                              ✗ Reject
                            </Button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="info"
                            onClick={() => openStatusModal(order, 'processing')}
                          >
                            Start Processing
                          </Button>
                        )}
                        {order.status === 'processing' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => openStatusModal(order, 'shipped')}
                          >
                            Mark Shipped
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => openStatusModal(order, 'delivered')}
                          >
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Update Order Status</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Change order status from <strong>{selectedOrder?.status}</strong> to{' '}
              <strong>{newStatus}</strong>?
            </p>
            {newStatus === 'confirmed' && (
              <Alert variant="info">
                A notification will be sent to the customer's phone number.
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleStatusChange}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>

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
                      <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                      <p><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                      <p><strong>Date:</strong> {formatDate(selectedOrder.created_at)}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Total:</strong> {formatPrice(selectedOrder.total)}</p>
                      <p><strong>Items:</strong> {selectedOrder.items?.length || 0}</p>
                    </Col>
                  </Row>
                </div>

                <div className="mb-4">
                  <h6>Customer Information</h6>
                  <p>
                    <strong>Name:</strong>{' '}
                    {selectedOrder.customer_name || 
                     (selectedOrder.shipping_address?.firstName && selectedOrder.shipping_address?.lastName
                       ? `${selectedOrder.shipping_address.firstName} ${selectedOrder.shipping_address.lastName}`
                       : (selectedOrder.shipping_address?.fn && selectedOrder.shipping_address?.ln
                         ? `${selectedOrder.shipping_address.fn} ${selectedOrder.shipping_address.ln}`
                         : 'Unknown Customer'))}
                  </p>
                  <p>
                    <strong>Email:</strong>{' '}
                    {selectedOrder.shipping_address?.email || selectedOrder.shipping_address?.e || 'No email'}
                  </p>
                  <p>
                    <strong>Phone:</strong>{' '}
                    {selectedOrder.customer_phone || selectedOrder.shipping_address?.phone || selectedOrder.shipping_address?.p || 'N/A'}
                  </p>
                  {selectedOrder.shipping_address?.address && (
                    <p>
                      <strong>Address:</strong>{' '}
                      {selectedOrder.shipping_address.address || selectedOrder.shipping_address.a || ''}
                      {selectedOrder.shipping_address.city || selectedOrder.shipping_address.c ? `, ${selectedOrder.shipping_address.city || selectedOrder.shipping_address.c}` : ''}
                      {selectedOrder.shipping_address.state || selectedOrder.shipping_address.s ? `, ${selectedOrder.shipping_address.state || selectedOrder.shipping_address.s}` : ''}
                      {selectedOrder.shipping_address.zipCode || selectedOrder.shipping_address.z ? ` ${selectedOrder.shipping_address.zipCode || selectedOrder.shipping_address.z}` : ''}
                    </p>
                  )}
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
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  )
}

export default Orders

