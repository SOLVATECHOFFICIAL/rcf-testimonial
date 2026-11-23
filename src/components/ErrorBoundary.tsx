import { Component, type ErrorInfo, type ReactNode } from 'react';
import { parseFirestoreErrorMessage } from '../lib/firebase';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: parseFirestoreErrorMessage(error),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught application error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 text-center">
            <h1 className="text-xl font-bold text-[#0B2545] mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-600 mb-6">{this.state.message}</p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.href = '/';
              }}
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0B2545] text-white text-sm font-medium hover:bg-[#133863] transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
