import { Component } from "react";

/**
 * Shows `fallback` (nothing by default) instead of unmounting the whole app when a child throws,
 * e.g. a lazily loaded chunk that is no longer on the server after a deploy.
 */
export default class ErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
