import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  Container,
  Table,
  Button,
  Badge,
  Alert,
  Modal,
  Form,
} from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { getProducts, deleteProduct } from '../../services/supabase'
import { formatPrice, getProductImage } from '../../utils/format'
import { showToast } from '../../utils/toast'
import { TableSkeleton } from '../../components/SkeletonLoader'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      showToast.error('Failed to load products')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!productToDelete) return

    try {
      await deleteProduct(productToDelete.id)
      showToast.success('Product deleted successfully')
      setShowDeleteModal(false)
      setProductToDelete(null)
      loadProducts()
    } catch (error) {
      showToast.error('Failed to delete product')
      console.error(error)
    }
  }

  const getStatusBadge = (stock) => {
    if (stock === 0) return <Badge bg="danger">Out of Stock</Badge>
    if (stock <= 10) return <Badge bg="warning">Low Stock</Badge>
    return <Badge bg="success">In Stock</Badge>
  }

  return (
    <>
      <Helmet>
        <title>Manage Products - Admin</title>
      </Helmet>

      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Manage Products</h2>
          <Button as={Link} to="/admin/products/new" variant="primary">
            ➕ Add New Product
          </Button>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : products.length === 0 ? (
          <Alert variant="info">
            No products found. <Link to="/admin/products/new">Add your first product</Link>
          </Alert>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={getProductImage(product.image)}
                        alt={product.name}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        className="rounded"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>
                      <Badge bg="secondary">{product.category || 'Uncategorized'}</Badge>
                    </td>
                    <td>{formatPrice(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>{getStatusBadge(product.stock)}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() => {
                            setProductToDelete(product)
                            setShowDeleteModal(true)
                          }}
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This
            action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  )
}

export default Products

