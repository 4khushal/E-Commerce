import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
} from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getProductById,
  createProduct,
  updateProduct,
  uploadProductImage,
} from '../../services/supabase'
import { showToast } from '../../utils/toast'
import { getProductImage } from '../../utils/format'

const ProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
    category: '',
    image: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingProduct, setLoadingProduct] = useState(isEdit)

  const categories = ['clothes', 'accessories', 'shoes', 'footwear', 'electronics', 'home']

  useEffect(() => {
    if (isEdit) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    try {
      setLoadingProduct(true)
      const product = await getProductById(id)
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: (product.price / 100).toString() || '',
        stock: product.stock?.toString() || '',
        sku: product.sku || '',
        category: product.category || '',
        image: product.image || '',
      })
      if (product.image) {
        setImagePreview(getProductImage(product.image))
      }
    } catch (error) {
      showToast.error('Failed to load product')
      console.error(error)
    } finally {
      setLoadingProduct(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = formData.image || ''

      // For new products: create first, then upload image
      // For editing: upload image first if new file selected
      if (isEdit && imageFile) {
        // Upload image for existing product
        try {
          imageUrl = await uploadProductImage(imageFile, id)
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError)
          showToast.warning('Product saved but image upload failed. You can add image URL manually.')
          // Continue without image - user can add URL later
        }
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
        stock: parseInt(formData.stock),
        sku: formData.sku || null,
        category: formData.category,
        image: imageUrl || null,
      }

      let createdProductId = null

      if (isEdit) {
        // For editing: update product, then upload image if new file selected
        await updateProduct(id, productData)
        
        // Upload new image if provided
        if (imageFile) {
          try {
            const uploadedImageUrl = await uploadProductImage(imageFile, id)
            // Update product with new image URL
            await updateProduct(id, { image: uploadedImageUrl })
            showToast.success('Product and image updated successfully')
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError)
            showToast.warning('Product updated but image upload failed. You can add image URL manually.')
          }
        } else {
          showToast.success('Product updated successfully')
        }
      } else {
        // For new products: create first, then upload image
        const createdProduct = await createProduct(productData)
        createdProductId = createdProduct.id
        showToast.success('Product created successfully')
        
        // Now upload image if we have one and product was created
        if (imageFile && createdProductId) {
          try {
            const uploadedImageUrl = await uploadProductImage(imageFile, createdProductId)
            // Update product with image URL
            await updateProduct(createdProductId, { image: uploadedImageUrl })
            showToast.success('Product image uploaded successfully')
          } catch (uploadError) {
            console.error('Image upload failed:', uploadError)
            showToast.warning('Product created but image upload failed. You can add image URL manually later.')
          }
        }
      }

      navigate('/admin/products')
    } catch (error) {
      console.error('Product creation error:', error)
      showToast.error(`Failed to ${isEdit ? 'update' : 'create'} product: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  if (loadingProduct) {
    return (
      <Container>
        <div className="text-center py-5">
          <p>Loading product...</p>
        </div>
      </Container>
    )
  }

  return (
    <>
      <Helmet>
        <title>{isEdit ? 'Edit' : 'Add'} Product - Admin</title>
      </Helmet>

      <Container>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/products')}>
            ← Back to Products
          </Button>
        </div>

        <Card>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Price (USD) *</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          min="0"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Stock Quantity *</Form.Label>
                        <Form.Control
                          type="number"
                          min="0"
                          name="stock"
                          value={formData.stock}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>SKU</Form.Label>
                        <Form.Control
                          type="text"
                          name="sku"
                          value={formData.sku}
                          onChange={handleChange}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Category *</Form.Label>
                        <Form.Select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Product Image</Form.Label>
                    {imagePreview && (
                      <div className="mb-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="img-fluid rounded border"
                          style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mb-2"
                    />
                    <Form.Text className="text-muted d-block mb-2">
                      Upload an image file (JPG, PNG, etc.)
                    </Form.Text>
                    <Form.Group className="mb-3">
                      <Form.Label>Or Enter Image URL</Form.Label>
                      <Form.Control
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                      />
                      <Form.Text className="text-muted">
                        You can upload a file or provide an image URL
                      </Form.Text>
                    </Form.Group>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex gap-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => navigate('/admin/products')}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  )
}

export default ProductForm

