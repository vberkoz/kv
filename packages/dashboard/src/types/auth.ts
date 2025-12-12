export interface AuthTokens {
  idToken: string;
  accessToken: string;
  expiresAt: number;
}

export interface User {
  email: string;
  given_name?: string;
  family_name?: string;
}
