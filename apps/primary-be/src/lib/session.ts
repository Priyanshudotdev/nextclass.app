import crypto from 'crypto';
import { Request } from 'express';

export const generateSesssionToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const extractTokenFromCookie = (cookie: Record<string, any>) => {
  const token: string | undefined = cookie
    .split('; ')
    .find((c: string) => c.startsWith('session='))
    ?.split('=')[1];

  if (!token) {
    return null;
  }

  return token;
};
