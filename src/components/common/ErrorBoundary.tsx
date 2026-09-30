import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled render error:', error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh items-center justify-center p-6">
          <div className="w-full max-w-md rounded-lg border border-edge bg-surface p-6 text-center">
            <h1 className="text-[15px] font-semibold text-ink">
              Repository analysis could not be completed.
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-faint">
              An unexpected error occurred while rendering this view. Reload the page or return to the start.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => window.location.assign('/')}
                className="rounded-md border border-edge px-3 py-1.5 text-xs font-medium text-dim transition-colors hover:text-ink"
              >
                Go home
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-canvas"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
