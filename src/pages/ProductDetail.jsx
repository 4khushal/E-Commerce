import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Form,
  Card,
  Alert,
} from 'react-bootstrap'
import { useProduct } from '../hooks/useProduct'
import { useCart } from '../context/CartContext'
import { ProductDetailSkeleton } from '../components/SkeletonLoader'
import ErrorMessage from '../components/ErrorMessage'
import { formatPrice, getProductImage } from '../utils/format'
import { showToast } from '../utils/toast'
import { useState } from 'react'

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { product, loading, error } = useProduct(id)
  const { addToCart, cartItems } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  // Create image array (support for multiple images in future)
  const productImages = product?.image
    ? [product.image]
    : ['/placeholder-image.jpg']

  const handleAddToCart = async () => {
    if (product && product.stock > 0) {
      try {
        await addToCart(product, quantity)
        showToast.success(
          `${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart!`
        )
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
      } catch (error) {
        console.error('Error adding to cart:', error)
        showToast.error('Failed to add item to cart. Please try again.')
      }
    }
  }

  if (loading)
    return (
      <Container className="my-4 my-md-5">
        <ProductDetailSkeleton />
      </Container>
    )
  if (error) return <ErrorMessage message={error} />
  if (!product)
    return (
      <Container className="my-5">
        <Alert variant="warning">
          <Alert.Heading>Product Not Found</Alert.Heading>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <Button variant="outline-primary" onClick={() => navigate('/products')}>
            Browse Products
          </Button>
        </Alert>
      </Container>
    )

  // Helper functions - only called when product exists
  const getStockStatus = () => {
    if (product.stock === 0) {
      return { text: 'Out of Stock', variant: 'danger', icon: '❌' }
    }
    if (product.stock <= 10) {
      return { text: 'Low Stock', variant: 'warning', icon: '⚠️' }
    }
    return { text: 'In Stock', variant: 'success', icon: '✅' }
  }

  const stockStatus = getStockStatus()
  const cartItem = cartItems.find((item) => item.id === product.id)
  const maxQuantity = Math.min(product.stock || 0, 10)

  return (
    <>
      <Helmet>
        <title>{product.name} - Ecommerce Store</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={getProductImage(product.image)} />
      </Helmet>

      <Container className="my-4 my-md-5">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Button
                variant="link"
                className="p-0 text-decoration-none"
                onClick={() => navigate('/products')}
              >
                Products
              </Button>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Success Alert */}
        {showSuccess && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setShowSuccess(false)}
            className="mb-4"
          >
            <strong>Success!</strong> {quantity} {quantity === 1 ? 'item' : 'items'}{' '}
            added to cart.
          </Alert>
        )}

        <Row>
          {/* Product Image Gallery */}
          <Col lg={6} className="mb-4 mb-lg-0">
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-0">
                {/* Main Image */}
                <div className="position-relative" style={{ aspectRatio: '1/1' }}>
                  <img
                    src={getProductImage(productImages[selectedImage])}
                    alt={product.name}
                    className="img-fluid rounded-top"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg'
                    }}
                  />
                  {/* Stock Badge Overlay */}
                  <div className="position-absolute top-0 end-0 m-3">
                    <Badge bg={stockStatus.variant} className="fs-6 px-3 py-2">
                      {stockStatus.icon} {stockStatus.text}
                    </Badge>
                  </div>
                </div>

                {/* Thumbnail Gallery (if multiple images) */}
                {productImages.length > 1 && (
                  <div className="p-3">
                    <Row className="g-2">
                      {productImages.map((image, index) => (
                        <Col xs={3} key={index}>
                          <div
                            className={`border rounded product-gallery-thumbnail ${
                              selectedImage === index
                                ? 'border-primary border-3 active'
                                : 'border-secondary'
                            }`}
                            style={{
                              aspectRatio: '1/1',
                              overflow: 'hidden',
                              cursor: 'pointer',
                            }}
                            onClick={() => setSelectedImage(index)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                setSelectedImage(index)
                              }
                            }}
                            aria-label={`Select image ${index + 1}`}
                          >
                            <img
                              src={getProductImage(image)}
                              alt={`${product.name} view ${index + 1}`}
                              className="img-fluid"
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                              onError={(e) => {
                                e.target.src = '/placeholder-image.jpg'
                              }}
                            />
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Product Information */}
          <Col lg={6}>
            <div className="h-100 d-flex flex-column">
              {/* Product Name */}
              <h1 className="mb-3 fw-bold">{product.name}</h1>

              {/* Price and Stock Status */}
              <div className="mb-4">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <span className="fs-2 fw-bold text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.stock > 0 && (
                    <Badge bg="success" className="fs-6 px-3 py-2">
                      {product.stock} in stock
                    </Badge>
                  )}
                </div>
                {cartItem && (
                  <Alert variant="info" className="py-2 mb-0">
                    <small>
                      <strong>{cartItem.quantity}</strong> in your cart
                    </small>
                  </Alert>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <h5 className="mb-2">Description</h5>
                <p className="text-muted" style={{ lineHeight: '1.8' }}>
                  {product.description || 'No description available.'}
                </p>
              </div>

              {/* Add to Cart Section */}
              {product.stock > 0 ? (
                <Card className="border-primary mb-4">
                  <Card.Body>
                    <Form.Label className="fw-semibold mb-2">
                      Quantity
                    </Form.Label>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <Form.Select
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        style={{ maxWidth: '120px' }}
                        aria-label="Select quantity"
                      >
                        {[...Array(maxQuantity)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </Form.Select>
                      <span className="text-muted">
                        Max: {maxQuantity} {maxQuantity === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleAddToCart}
                      className="w-100"
                      disabled={quantity > product.stock}
                    >
                      🛒 Add to Cart
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                <Alert variant="danger" className="mb-4">
                  <Alert.Heading>Out of Stock</Alert.Heading>
                  <p className="mb-0">
                    This product is currently unavailable. Please check back later.
                  </p>
                </Alert>
              )}

              {/* Product Details */}
              <Card className="border-0 bg-light">
                <Card.Body>
                  <h5 className="mb-3">Product Details</h5>
                  <Row className="g-3">
                    <Col xs={6}>
                      <div>
                        <small className="text-muted d-block">SKU</small>
                        <strong>{product.sku || 'N/A'}</strong>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div>
                        <small className="text-muted d-block">Category</small>
                        <strong className="text-capitalize">
                          {product.category || 'Uncategorized'}
                        </strong>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div>
                        <small className="text-muted d-block">Stock Available</small>
                        <strong>{product.stock} units</strong>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div>
                        <small className="text-muted d-block">Status</small>
                        <Badge bg={stockStatus.variant}>{stockStatus.text}</Badge>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default ProductDetail

