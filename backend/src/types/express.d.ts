import { JWTPayload as BaseJWTPayload } from 'jose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

declare module 'jose' {
  interface JWTPayload {
    id?: string;
    email?: string;
    role?: string;
  }
}

export {};