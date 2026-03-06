import { Prisma } from '@prisma/client';
import type { User } from 'db';
import { authUserSelect } from '../modules/auth/model';

export type AuthUser = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
