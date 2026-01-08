import { Card, Placeholder } from 'react-bootstrap'

export const ProductCardSkeleton = () => {
  return (
    <Card className="h-100">
      <div className="skeleton-image-container" style={{ height: '200px', overflow: 'hidden' }}>
        <Placeholder animation="glow" style={{ width: '100%', height: '100%' }} />
      </div>
      <Card.Body>
        <Placeholder as={Card.Title} animation="glow">
          <Placeholder xs={8} />
        </Placeholder>
        <Placeholder as={Card.Text} animation="glow" className="mt-2">
          <Placeholder xs={12} /> <Placeholder xs={10} />
        </Placeholder>
        <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
          <Placeholder animation="glow">
            <Placeholder xs={4} size="lg" />
          </Placeholder>
          <Placeholder.Button xs={6} size="lg" animation="glow" />
        </div>
      </Card.Body>
    </Card>
  )
}

export const ProductDetailSkeleton = () => {
  return (
    <div className="row g-4">
      <div className="col-lg-6">
        <Placeholder animation="glow" style={{ aspectRatio: '1/1' }}>
          <Placeholder xs={12} style={{ height: '100%', borderRadius: '8px' }} />
        </Placeholder>
      </div>
      <div className="col-lg-6">
        <Placeholder as="h1" animation="glow" className="mb-3">
          <Placeholder xs={8} />
        </Placeholder>
        <Placeholder animation="glow" className="mb-3">
          <Placeholder xs={4} size="lg" />
        </Placeholder>
        <Placeholder animation="glow" className="mb-4">
          <Placeholder xs={12} /> <Placeholder xs={12} /> <Placeholder xs={10} />
        </Placeholder>
        <Placeholder.Button xs={12} size="lg" animation="glow" className="mb-4" />
        <Card className="border-0 bg-light">
          <Card.Body>
            <Placeholder as="h5" animation="glow" className="mb-3">
              <Placeholder xs={6} />
            </Placeholder>
            <div className="row g-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="col-6">
                  <Placeholder animation="glow">
                    <Placeholder xs={8} />
                  </Placeholder>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export const TableSkeleton = ({ rows = 3 }) => {
  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {[1, 2, 3, 4, 5].map((i) => (
              <th key={i}>
                <Placeholder xs={6} animation="glow" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[1, 2, 3, 4, 5].map((i) => (
                <td key={i}>
                  <Placeholder xs={8} animation="glow" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductCardSkeleton

