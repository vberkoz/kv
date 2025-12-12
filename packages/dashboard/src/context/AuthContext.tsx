import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthTokens, User } from '../types/auth';
import { COGNITO_DOMAIN, COGNITO_CLIENT_ID, COGNITO_REDIRECT_URI, COGNITO_LOGOUT_URI, STORAGE_KEYS } from '../constants/config';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginWithHostedUI: (provider?: 'Google') => void;
  logout: () => void;
  processAuthRedirect: (hash: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const decodeJwt = (token: string): { email: string; name?: string; given_name?: string; family_name?: string; 'cognito:username'?: string } => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return { email: '', name: undefined, 'cognito:username': undefined };
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedTokens = localStorage.getItem(STORAGE_KEYS.COGNITO_TOKENS);
    if (storedTokens) {
      const parsedTokens: AuthTokens = JSON.parse(storedTokens);
      if (parsedTokens.expiresAt > Date.now()) {
        setTokens(parsedTokens);
        const payload = decodeJwt(parsedTokens.idToken);
        setUser({ 
          email: payload.email, 
          given_name: payload.given_name || payload.name || payload['cognito:username'] || '',
          family_name: payload.family_name
        });
      } else {
        localStorage.removeItem(STORAGE_KEYS.COGNITO_TOKENS);
      }
    }
  }, []);

  const loginWithHostedUI = useCallback((provider?: 'Google') => {
    const providerParam = provider ? `&identity_provider=${provider}` : '';
    const authUrl = `${COGNITO_DOMAIN}/oauth2/authorize?` +
      `response_type=token&` + 
      `client_id=${COGNITO_CLIENT_ID}&` +
      `scope=openid%20email%20profile&` +
      `redirect_uri=${COGNITO_REDIRECT_URI}` +
      providerParam;
    window.location.assign(authUrl);
  }, []);

  const processAuthRedirect = useCallback((hash: string) => {
    const params = new URLSearchParams(hash.substring(1));
    const idToken = params.get('id_token');
    const accessToken = params.get('access_token');
    const expiresIn = params.get('expires_in');

    if (idToken && accessToken && expiresIn) {
      const expiresAt = Date.now() + (parseInt(expiresIn) * 1000);
      const newTokens: AuthTokens = { idToken, accessToken, expiresAt };
      
      localStorage.setItem(STORAGE_KEYS.COGNITO_TOKENS, JSON.stringify(newTokens));
      setTokens(newTokens);
      
      const payload = decodeJwt(idToken);
      setUser({ 
        email: payload.email, 
        given_name: payload.given_name || payload.name || payload['cognito:username'] || '',
        family_name: payload.family_name
      });
      
      navigate('/dashboard');
    } else {
      console.error('Authentication failed: Missing tokens');
      navigate('/login');
    }
  }, [navigate]);

  const logout = useCallback(() => {
    setTokens(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.COGNITO_TOKENS);
    
    const logoutUrl = `${COGNITO_DOMAIN}/logout?` +
      `client_id=${COGNITO_CLIENT_ID}&` +
      `logout_uri=${COGNITO_LOGOUT_URI}`;
    window.location.assign(logoutUrl);
  }, []);

  const isAuthenticated = !!tokens && tokens.expiresAt > Date.now();

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loginWithHostedUI, logout, processAuthRedirect }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
