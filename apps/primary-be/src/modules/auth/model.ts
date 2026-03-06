enum UserRole {
  ADMIN,
  TEACHER,
  STUDENT,
  PARENT,
}

export type UserRegistrationRequestSchema = {
  instituteId: string;
  name: string;
  email: string;
  password: string;
  address: string;
  state: string;
  city: string;
  role: UserRole;
};

export type UserLoginRequestSchema = {
  instituteId: string;
  email: string;
  password: string;
};

export type AuthSession = {
  id: string;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export const authUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  instituteId: true,
  address: true,
  city: true,
  state: true,
  status: true,
} as const;
