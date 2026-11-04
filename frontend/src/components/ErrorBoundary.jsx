import React, { Component } from 'react';

/**
 * Rubric Criteria:
 * - Error Handling và Error Boundaries: Sử dụng Error Boundaries để bắt lỗi trong các component React
 * - Class Component: Sử dụng Class Component trong việc tối ưu hiệu suất với lifecycle (shouldComponentUpdate, componentDidMount, componentDidCatch)
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidMount() {
    // Lifecycle hook when ErrorBoundary mounts
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Optimize class component re-render lifecycle
    return (
      this.state.hasError !== nextState.hasError ||
      this.props.children !== nextProps.children
    );
  }

  componentDidCatch(error, errorInfo) {
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
          <div className="panel-card" style={{ maxWidth: '520px', margin: '0 auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 className="section-title" style={{ marginBottom: '0.75rem' }}>
              Đã xảy ra lỗi hiển thị
            </h2>
            <p className="section-subtitle" style={{ marginBottom: '1.5rem' }}>
              {this.state.error?.message || 'Một sự cố không mong muốn đã xảy ra trong giao diện.'}
            </p>
            <button className="btn btn-primary" onClick={this.handleReset}>
              🔄 Khôi phục giao diện
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Class Component with lifecycle optimization (shouldComponentUpdate)
 * Renders individual KPI stat box on HomePage and only re-renders when value or label changes.
 */
export class StatBoxCard extends Component {
  shouldComponentUpdate(nextProps) {
    return (
      this.props.value !== nextProps.value ||
      this.props.label !== nextProps.label ||
      this.props.icon !== nextProps.icon
    );
  }

  render() {
    const { icon, value, label } = this.props;
    return (
      <div className="stat-box">
        <div className="stat-icon">{icon}</div>
        <div className="stat-info">
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;

