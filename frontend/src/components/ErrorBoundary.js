import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(error, info);
  }

  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container" style={{ display: 'grid', gap: 16, justifyItems: 'start', padding: '96px var(--gutter)' }}>
        <h1 className="title">Something went wrong.</h1>
        <p className="lede">Please reload the page. If it keeps happening, try again later.</p>
        <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Reload the page</button>
      </div>
    );
  }
}

export default ErrorBoundary;
