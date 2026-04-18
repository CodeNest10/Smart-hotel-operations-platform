import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import './ErrorBoundary.css';

/**
 * Catches render-phase errors in the component tree and shows a friendly
 * fallback UI instead of a white screen. In development it also shows the
 * stack trace to make debugging easier.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In a real deployment we'd ship this to Sentry / Datadog.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
    this.setState({ info });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, info: null });
    window.location.reload();
  };

  handleHome = () => {
    this.setState({ hasError: false, error: null, info: null });
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isDev = process.env.NODE_ENV !== 'production';

    return (
      <div className="eb-shell">
        <div className="eb-card">
          <div className="eb-icon-wrap">
            <AlertTriangle size={36} />
          </div>
          <h1 className="eb-title">Something went wrong</h1>
          <p className="eb-sub">
            The app hit an unexpected error and couldn't render this page.
            You can retry or go back home — your data is safe.
          </p>

          <div className="eb-actions">
            <button className="btn btn-primary" onClick={this.handleReload}>
              <RefreshCcw size={15} /> Reload
            </button>
            <button className="btn btn-outline" onClick={this.handleHome}>
              <Home size={15} /> Go home
            </button>
          </div>

          {isDev && this.state.error && (
            <details className="eb-details" open>
              <summary>Error details (dev only)</summary>
              <pre className="eb-pre">
                {String(this.state.error?.stack || this.state.error)}
                {this.state.info?.componentStack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
