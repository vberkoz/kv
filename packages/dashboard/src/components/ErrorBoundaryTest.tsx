import { useState } from 'react';
import { Button } from './ui/Button';

/**
 * Test component to demonstrate error boundary functionality
 * This component can be temporarily added to any page to test error handling
 * 
 * Usage:
 * import { ErrorBoundaryTest } from '@/components/ErrorBoundaryTest';
 * <ErrorBoundaryTest />
 */
export function ErrorBoundaryTest() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Test error: This is a simulated error to test the error boundary');
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-semibold text-yellow-900 mb-2">Error Boundary Test</h3>
      <p className="text-sm text-yellow-700 mb-3">
        Click the button below to trigger a test error and see the error boundary in action.
      </p>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => setShouldError(true)}
      >
        Trigger Test Error
      </Button>
    </div>
  );
}
