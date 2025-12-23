import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { AuthProvider } from './context/AuthContext';
import { TooltipProvider } from './components/ui/Tooltip';
import { Toaster } from './components/Toaster';
import { ErrorFallback } from './components/ErrorFallback';
import { SkipLink } from './components/SkipLink';
import { logErrorToService } from './services/errorLogger';
import ProtectedRoute from './components/ProtectedRoute';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NamespacesPage = lazy(() => import('./pages/NamespacesPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={logErrorToService}
      onReset={() => window.location.href = '/dashboard'}
    >
      <BrowserRouter>
        <SkipLink />
        <AuthProvider>
          <TooltipProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/auth-callback" element={<AuthCallback />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/namespaces"
                  element={
                    <ProtectedRoute>
                      <NamespacesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pricing"
                  element={
                    <ProtectedRoute>
                      <PricingPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
