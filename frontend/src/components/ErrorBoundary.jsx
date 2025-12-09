import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          textAlign: 'center',
          py: 4
        }}>
          <Typography variant="h2" gutterBottom>
            Oops! Something went wrong.
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            We encountered an unexpected error.
          </Typography>
          
          <Box sx={{ 
            my: 4, 
            p: 3, 
            bgcolor: '#f8d7da', 
            color: '#721c24', 
            borderRadius: 2, 
            width: '100%',
            overflow: 'auto',
            textAlign: 'left',
            fontFamily: 'monospace'
          }}>
            <Typography variant="body1" component="div" fontWeight="bold">
              {this.state.error && this.state.error.toString()}
            </Typography>
            {this.state.errorInfo && (
              <Typography variant="body2" component="pre" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                {this.state.errorInfo.componentStack}
              </Typography>
            )}
          </Box>

          <Button 
            variant="contained" 
            size="large" 
            startIcon={<RotateCcw />}
            onClick={this.handleReload}
          >
            Reload Page
          </Button>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
