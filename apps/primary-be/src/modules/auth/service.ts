import { NextFunction, Request, Response } from 'express';
import { AuthSession, UserLoginRequestSchema, UserRegistrationRequestSchema } from './model';
import { prisma } from 'db';
import bcrypt from 'bcryptjs';
import { extractTokenFromCookie, generateSesssionToken } from '../../lib/session';

const hashPassword = async (rawPassword: string): Promise<string> => {
  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  return hashedPassword;
};

const comparePassword = async (rawPassword: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(rawPassword, hashedPassword);
};

const createSession = async (userId: string, req: Request, res: Response): Promise<AuthSession> => {
  const token = generateSesssionToken();

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    },
  });

  res.setHeader(
    'Set-Cookie',
    `session=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict`
  );

  return session;
};

const userRegistrationHandler = async (req: Request, res: Response, next: NextFunction) => {
  const userData: UserRegistrationRequestSchema = req.body;

  const userExists = await prisma.user.findFirst({
    where: {
      email: userData.email,
    },
  });

  if (userExists) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashedPassword = await hashPassword(userData.password);

  try {
    const response = await prisma.user.create({
      data: {
        instituteId: userData.instituteId,
        address: userData.address,
        city: userData.city,
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        state: userData.state,
      },
    });

    await createSession(response.id, req, res);

    return res.status(201).json({ message: 'User created successfully', data: response });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
};

const userLoginHandler = async (req: Request, res: Response, next: NextFunction) => {
  const userData: UserLoginRequestSchema = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email: userData.email,
      instituteId: userData.instituteId,
    },
  });

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  try {
    const isPasswordCorrect = await comparePassword(userData.password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await createSession(user.id, req, res);

    return res.status(200).json({ message: 'Login successful', data: user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to login user' });
  }
};

const logoutUserHandler = async (req: Request, res: Response) => {
  const cookie = req.cookies;
  const token = extractTokenFromCookie(cookie);

  if (!token) {
    return res.status(400).json({ error: 'Session token not found' });
  }

  const response = await prisma.session.delete({
    where: {
      token,
    },
  });

  if (!response) {
    return res.status(400).json({ error: 'Session not found' });
  }

  res.clearCookie('session');
  return res.status(200).json({ message: 'Logout successful' });
};

const editUserHandler = async (req: Request, res: Response) => {};

//TODO: Add Editing Funcationality

/* ADMIN ROUTES */
const adminUserDeletionHandler = async (req: Request<{ id: string }>, res: Response) => {
  const targetUserId = req.params.id;
  const user = req.user;

  if (user.role != 'ADMIN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (targetUserId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const response = await prisma.user.update({
      where: {
        id: targetUserId,
      },
      data: {
        isDeleted: true,
      },
    });

    if (!response) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete user' });
  }
};

export { userRegistrationHandler, userLoginHandler, logoutUserHandler, adminUserDeletionHandler };
