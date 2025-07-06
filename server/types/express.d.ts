import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
      username?: string | null;
      isEmailVerified: boolean;
    };
  }
}

export interface AuthenticatedRequest extends Request {
  user: NonNullable<Request['user']>;
}

export type CustomRequest = Request;
