import { Spinner } from 'react-bootstrap'

const LoadingSpinner = ({ size = 'lg', text = 'Loading...' }) => {
  return (
    <div className="spinner-container">
      <div className="text-center">
        <Spinner
          animation="border"
          role="status"
          size={size}
          variant="primary"
          className="mb-3"
        >
          <span className="visually-hidden">{text}</span>
        </Spinner>
        {text && <p className="text-muted mb-0">{text}</p>}
      </div>
    </div>
  )
}

export default LoadingSpinner

