import { prisma } from 'db';
import { NextFunction, Request, Response } from 'express';
import { authUserSelect } from '../modules/auth/model';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const cookie = req.headers.cookie;
  if (!cookie) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = cookie
    .split('; ')
    .find((c) => c.startsWith('session='))
    ?.split('=')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const session = await prisma.session.findFirst({
    where: {
      token,
    },
    include: {
      user: {
        select: authUserSelect,
      },
    },
  });

  if (!session) {
    return res.status(401).json({ message: 'Session expired' });
  }

  req.user = session.user;

  next();
};
