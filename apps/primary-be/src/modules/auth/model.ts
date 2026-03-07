enum UserRole {
  ADMIN,
  TEACHER,
  STUDENT,
  PARENT,
}

// For new institute registration (Admin creating a new institute)
export type AdminRegistrationRequestSchema = {
  // Institute info
  instituteName: string;
  instituteType?: string;
  studentCount?: string;
  instituteAddress: string;
  instituteCity: string;
  instituteState: string;
  institutePincode?: string;
  instituteCountry?: string;
  // Admin user info
  name: string;
  email: string;
  password: string;
};

// For existing institute user registration (user joining an existing institute)
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
  institute: {
    select: {
      id: true,
      name: true,
      logo: true,
      address: true,
      city: true,
      state: true,
      country: true,
      pincode: true,
    },
  },
} as const;
