export const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
export const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
export const COGNITO_REDIRECT_URI = import.meta.env.VITE_COGNITO_REDIRECT_URI;
export const COGNITO_LOGOUT_URI = import.meta.env.VITE_COGNITO_LOGOUT_URI;

export const STORAGE_KEYS = {
  COGNITO_TOKENS: 'cognitoTokens',
} as const;
