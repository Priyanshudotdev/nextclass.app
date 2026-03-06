- create a lib/session file for generating unique session tokens
- then create a func in service to create a session where we will be taking userId, req and res 

typescript```
import { prisma } from "../db";
import { generateSessionToken } from "../lib/session";

async function createSession(userId: string, req: any, res: any) {
  const token = generateSessionToken();

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    }
  });

  res.setHeader(
    "Set-Cookie",
    `session=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict`
  );

  return session;
}
```

- use this function while logging the user
- create a auth middleware for checking the sessions from cookies
- use it in protected routes


const userDeletionHandler = async (req: Request<{ id: string }>, res: Response) => {
  const targetUserId = req.params.id;
  const admin = req.user;

  
  if (!admin) {
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