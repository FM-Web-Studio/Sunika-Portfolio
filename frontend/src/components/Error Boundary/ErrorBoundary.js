import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import styles from './ErrorBoundary.module.css';

class ErrorBoundaryInner extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  handleReload = () => {
    const { onReset } = this.props;
    if (onReset) onReset();
    else window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { theme } = this.props;

      return (
        <div className={styles.root} data-theme={theme}>
          <div className={styles.card}>

            <div className={styles.iconWrap} aria-hidden="true">
              <span className={styles.iconText}>!</span>
            </div>

            <div className={styles.message}>
              <h1 className={styles.title}>Something went wrong</h1>
              <p className={styles.subtitle}>
                An unexpected error occurred. Try reloading, if it keeps
                happening, go back home.
              </p>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={this.handleReload}
              >
                Reload Page
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={this.handleGoHome}
              >
                Go Home
              </button>
            </div>

            {this.state.error && (
              <details className={styles.details}>
                <summary className={styles.detailsSummary}>
                  Technical details
                </summary>
                <div className={styles.detailsBody}>
                  <pre className={styles.pre}>{this.state.error.toString()}</pre>
                  {this.state.errorInfo && (
                    <pre className={styles.pre}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ErrorBoundary = (props) => {
  const { theme } = useTheme();
  return <ErrorBoundaryInner {...props} theme={theme} />;
};

export default ErrorBoundary;
