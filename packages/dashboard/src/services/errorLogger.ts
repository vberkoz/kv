const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ErrorLog {
  message: string;
  stack?: string;
  componentStack?: string | null;
  url: string;
  userAgent: string;
  timestamp: string;
}

export async function logErrorToService(error: Error, errorInfo: { componentStack?: string | null }) {
  try {
    const errorLog: ErrorLog = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    await fetch(`${API_URL}/v1/errors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorLog),
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
}
