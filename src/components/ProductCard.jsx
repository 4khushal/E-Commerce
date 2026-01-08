import { Card, Button, Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice, getProductImage } from '../utils/format'

const ProductCard = ({ product }) => {
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    addToCart(product, 1)
  }

  return (
    <Card className="h-100 product-card">
      <Link to={`/products/${product.id}`} className="text-decoration-none">
        <Card.Img
          variant="top"
          src={getProductImage(product.image)}
          alt={product.name}
          style={{ height: '200px', objectFit: 'cover' }}
          onError={(e) => {
            e.target.src = '/placeholder-image.jpg'
          }}
        />
      </Link>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-dark">{product.name}</Card.Title>
        <Card.Text className="text-muted flex-grow-1">
          {product.description?.substring(0, 100)}
          {product.description?.length > 100 && '...'}
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div>
            <Badge bg="success" className="fs-6">
              {formatPrice(product.price)}
            </Badge>
            {product.stock <= 10 && product.stock > 0 && (
              <Badge bg="warning" className="ms-2">
                Low Stock
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge bg="danger" className="ms-2">
                Out of Stock
              </Badge>
            )}
          </div>
          <Button
            variant="primary"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            Add to Cart
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default ProductCard

