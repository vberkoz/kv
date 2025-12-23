import { FallbackProps } from 'react-error-boundary';
import { Button } from './ui/Button';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
        </div>
        
        <p className="text-gray-600 mb-4">
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        
        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
            Error details
          </summary>
          <pre className="mt-2 text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto">
            {error.message}
          </pre>
        </details>
        
        <div className="flex gap-3">
          <Button onClick={resetErrorBoundary} className="flex-1">
            Try Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
