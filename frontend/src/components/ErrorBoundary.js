import React from 'react';
import { Alert } from 'react-bootstrap';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="danger" className="m-3">
          <Alert.Heading>Something went wrong</Alert.Heading>
          <p>
            We're sorry, but there was an error loading this component. 
            Please try refreshing the page.
          </p>
          <hr />
          <p className="mb-0">
            Error details: {this.state.error?.message || 'Unknown error'}
          </p>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 