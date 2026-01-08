import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import { ProductCardSkeleton } from '../components/SkeletonLoader'
import SearchBar from '../components/SearchBar'

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const { products, loading, error } = useProducts(searchTerm)
  const featuredProducts = products.slice(0, 8)

  return (
    <>
      <Helmet>
        <title>Home - Ecommerce Store</title>
        <meta
          name="description"
          content="Welcome to our ecommerce store. Shop the latest products at great prices."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <h1 className="display-4 fw-bold mb-4">
                Welcome to Our Store
              </h1>
              <p className="lead mb-4">
                Discover amazing products at unbeatable prices. Shop now and
                enjoy fast shipping and excellent customer service.
              </p>
              <Button as={Link} to="/products" variant="light" size="lg">
                Shop Now
              </Button>
            </Col>
            <Col lg={6} className="text-center">
              <div className="mt-4 mt-lg-0">
                <SearchBar onSearch={setSearchTerm} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Featured Products */}
      <Container className="my-5">
        <Row className="mb-4">
          <Col>
            <h2 className="text-center mb-4">Featured Products</h2>
          </Col>
        </Row>

        {loading ? (
          <Row>
            {[...Array(8)].map((_, i) => (
              <Col key={i} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <ProductCardSkeleton />
              </Col>
            ))}
          </Row>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No products found.</p>
          </div>
        ) : (
          <Row>
            {featuredProducts.map((product) => (
              <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        )}

        {products.length > 8 && (
          <Row className="mt-4">
            <Col className="text-center">
              <Button as={Link} to="/products" variant="outline-primary" size="lg">
                View All Products
              </Button>
            </Col>
          </Row>
        )}
      </Container>
    </>
  )
}

export default Home

