'use client';
import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <p className={styles.icon}>⚠️</p>
          <h3>Algo deu errado</h3>
          <p className={styles.message}>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })} className={styles.retry}>
            Tentar novamente
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
