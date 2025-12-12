import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const { processAuthRedirect } = useAuth();

  useEffect(() => {
    if (window.location.hash) {
      processAuthRedirect(window.location.hash);
    }
  }, [processAuthRedirect]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    </div>
  );
}
