/** Claims carried on the access token. */
export interface AccessTokenClaims {
  sub: string; // user id
  email: string;
  name: string;
  roleId: string;
  role: string; // role name
  permissions: string[]; // resolved permission names, or ["*"] for Super Admin
}

/** Claims carried on the refresh token (minimal — just enough to rotate). */
export interface RefreshTokenClaims {
  sub: string; // user id
  sid: string; // session id
}

/** Authenticated request context exposed to guards and route handlers. */
export interface AuthContext {
  userId: string;
  email: string;
  name: string;
  roleId: string;
  role: string;
  permissions: string[];
}

/** Public-safe user summary returned by auth endpoints. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  roleId: string;
}
