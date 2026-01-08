import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Container, Row, Col, Form, Button, Badge } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import { ProductCardSkeleton } from '../components/SkeletonLoader'
import SearchBar from '../components/SearchBar'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchTerm = searchParams.get('search') || ''
  const [sortBy, setSortBy] = useState('newest')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { products, loading, error } = useProducts(searchTerm, selectedCategory)

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'clothes', label: 'Clothes' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'footwear', label: 'Footwear' },
  ]

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'name':
        return a.name.localeCompare(b.name)
      default:
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })

  const handleCategoryChange = (category) => {
    setSelectedCategory(category)
    // Clear search when changing category
    if (searchTerm) {
      setSearchParams({})
    }
  }

  return (
    <>
      <Helmet>
        <title>Products - Ecommerce Store</title>
        <meta
          name="description"
          content="Browse our complete product catalog. Find the perfect products for your needs."
        />
      </Helmet>

      <Container className="my-5">
        {/* Header Section */}
        <Row className="mb-4">
          <Col>
            <h1 className="mb-3">Shop Our Products</h1>
            <p className="text-muted mb-4">
              Discover amazing products across all categories
            </p>
            <SearchBar />
          </Col>
        </Row>

        {/* Category Filter */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <span className="fw-semibold me-2">Categories:</span>
              {categories.map((category) => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => handleCategoryChange(category.value)}
                  className="text-capitalize"
                >
                  {category.label}
                  {selectedCategory === category.value && (
                    <Badge bg="light" text="dark" className="ms-2">
                      {products.length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </Col>
        </Row>

        {/* Sort and Results Count */}
        <Row className="mb-4 align-items-center">
          <Col md={4}>
            <Form.Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </Form.Select>
          </Col>
          <Col md={8} className="text-md-end mt-3 mt-md-0">
            <p className="text-muted mb-0">
              <strong>{sortedProducts.length}</strong> product{sortedProducts.length !== 1 ? 's' : ''} found
              {selectedCategory !== 'all' && (
                <span className="ms-2">
                  in <strong className="text-capitalize">{selectedCategory}</strong>
                </span>
              )}
            </p>
          </Col>
        </Row>

        {/* Loading State */}
        {loading && (
          <Row>
            {[...Array(8)].map((_, i) => (
              <Col key={i} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <ProductCardSkeleton />
              </Col>
            ))}
          </Row>
        )}

        {/* Error State */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <strong>Error loading products:</strong> {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && sortedProducts.length === 0 && (
          <div className="text-center py-5">
            <div className="mb-3">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="text-muted mb-2">No products found</h4>
            <p className="text-muted">
              {searchTerm
                ? `No products match "${searchTerm}"`
                : selectedCategory !== 'all'
                ? `No products in ${selectedCategory} category`
                : 'No products available at the moment'}
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <Button
                variant="outline-primary"
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchParams({})
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && sortedProducts.length > 0 && (
          <Row>
            {sortedProducts.map((product) => (
              <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  )
}

export default Products

