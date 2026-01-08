import { Alert } from 'react-bootstrap'

const ErrorMessage = ({ message, onDismiss }) => {
  return (
    <Alert variant="danger" dismissible onClose={onDismiss}>
      <Alert.Heading>Error!</Alert.Heading>
      <p>{message}</p>
    </Alert>
  )
}

export default ErrorMessage

