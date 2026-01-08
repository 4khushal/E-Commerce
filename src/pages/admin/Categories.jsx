import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Container, Card, Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap'
import { supabase } from '../../services/supabase'
import { showToast } from '../../utils/toast'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [loading, setLoading] = useState(false)

  const defaultCategories = ['clothes', 'accessories', 'shoes', 'footwear', 'electronics', 'home']

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      // Get unique categories from products
      const { data, error } = await supabase
        .from('products')
        .select('category')
      
      if (error) throw error

      const uniqueCategories = [
        ...new Set(
          data
            .map((p) => p.category)
            .filter((c) => c && c.trim() !== '')
        ),
      ].sort()

      setCategories(uniqueCategories.length > 0 ? uniqueCategories : defaultCategories)
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories(defaultCategories)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      showToast.warning('Please enter a category name')
      return
    }

    if (categories.includes(newCategory.toLowerCase())) {
      showToast.warning('Category already exists')
      return
    }

    setCategories([...categories, newCategory.toLowerCase()].sort())
    setNewCategory('')
    showToast.success('Category added (save products to persist)')
  }

  const handleRemoveCategory = (categoryToRemove) => {
    if (defaultCategories.includes(categoryToRemove)) {
      showToast.warning('Cannot remove default category')
      return
    }

    setCategories(categories.filter((c) => c !== categoryToRemove))
    showToast.success('Category removed')
  }

  return (
    <>
      <Helmet>
        <title>Manage Categories - Admin</title>
      </Helmet>

      <Container>
        <h2 className="mb-4">Manage Categories</h2>

        <Row>
          <Col md={8}>
            <Card>
              <Card.Body>
                <h5 className="mb-3">Existing Categories</h5>
                {categories.length === 0 ? (
                  <Alert variant="info">No categories found.</Alert>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Badge
                        key={category}
                        bg="primary"
                        className="p-2 d-flex align-items-center gap-2"
                        style={{ fontSize: '1rem' }}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                        {!defaultCategories.includes(category) && (
                          <Button
                            variant="link"
                            className="text-white p-0 ms-2"
                            style={{ fontSize: '0.875rem' }}
                            onClick={() => handleRemoveCategory(category)}
                          >
                            ✕
                          </Button>
                        )}
                      </Badge>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card>
              <Card.Body>
                <h5 className="mb-3">Add New Category</h5>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleAddCategory()
                  }}
                >
                  <Form.Group className="mb-3">
                    <Form.Label>Category Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value.toLowerCase())}
                      placeholder="e.g., electronics"
                    />
                  </Form.Group>
                  <Button type="submit" variant="primary" className="w-100">
                    Add Category
                  </Button>
                </Form>
                <Alert variant="info" className="mt-3 small">
                  <strong>Note:</strong> Categories are automatically created when you
                  assign them to products. This is a visual management tool.
                </Alert>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  )
}

export default Categories

