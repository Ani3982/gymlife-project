import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div id="react-error-boundary-debug" style={{ 
          padding: '40px', 
          background: '#111', 
          color: '#ff4d4d', 
          border: '3px solid #ff4d4d', 
          margin: '40px', 
          fontFamily: 'monospace',
          borderRadius: '8px',
          boxShadow: '0 0 20px rgba(255, 77, 77, 0.3)'
        }}>
          <h2 style={{ color: '#ff4d4d', marginBottom: '20px' }}>React Runtime Error Detected</h2>
          <div style={{ background: '#222', padding: '20px', borderRadius: '4px', overflowX: 'auto', marginBottom: '20px', border: '1px solid #444' }}>
            <strong>Error:</strong> {this.state.error && this.state.error.toString()}
          </div>
          {this.state.error && this.state.error.stack && (
            <div style={{ background: '#222', padding: '20px', borderRadius: '4px', overflowX: 'auto', border: '1px solid #444' }}>
              <strong>Stack Trace:</strong>
              <pre style={{ margin: '10px 0 0 0', color: '#ccc' }}>{this.state.error.stack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
