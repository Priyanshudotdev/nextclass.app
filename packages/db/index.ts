import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from './generated/prisma/client';

export type { User } from './generated/prisma/client';
export { Prisma };
export {
  UserRole,
  AttendanceStatus,
  ChatRoomType,
  MessagePermission,
  MessageType,
  NotificationType,
} from './generated/prisma/client';

// Lazy initialization - connection string must be set by the consuming app via dotenv
let prismaInstance: PrismaClient | null = null;

export const getPrisma = (): PrismaClient => {
  if (!prismaInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const adapter = new PrismaPg({ connectionString });
    prismaInstance = new PrismaClient({ adapter });
  }
  return prismaInstance;
};

// Re-export for backwards compatibility (initialized lazily on first access)
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getPrisma()[prop as keyof PrismaClient];
  },
});
