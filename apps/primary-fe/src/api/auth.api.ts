import api from '@/lib/axios';

// Types derived from backend schema
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface Institute {
  id: string;
  name: string;
  logo: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface User {
  id: string;
  name: string;
  email: string | null;
  role: UserRole;
  instituteId: string;
  address: string | null;
  city: string | null;
  state: string | null;
  status: UserStatus;
  institute?: Institute;
}

export interface LoginPayload {
  email: string;
  password: string;
  instituteId: string;
}

// Admin registration - creates new institute + admin user
export interface AdminRegisterPayload {
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
}

// User registration - joins existing institute
export interface RegisterPayload {
  instituteId: string;
  name: string;
  email: string;
  password: string;
  address: string;
  city: string;
  state: string;
}

// API response types
interface ApiResponse<T> {
  message?: string;
  data: T;
  error?: string;
}

// --- API functions ---

export const loginUser = async (
  payload: LoginPayload,
): Promise<ApiResponse<User>> => {
  const res = await api.post<ApiResponse<User>>('/api/auth/login', payload);
  return res.data;
};

// Admin registration - creates institute + admin user
export const registerAdmin = async (
  payload: AdminRegisterPayload,
): Promise<ApiResponse<User>> => {
  const res = await api.post<ApiResponse<User>>('/api/auth/register', payload);
  return res.data;
};

// User registration - joins existing institute
export const registerUser = async (
  payload: RegisterPayload,
): Promise<ApiResponse<User>> => {
  const res = await api.post<ApiResponse<User>>('/api/auth/signup', payload);
  return res.data;
};

export const logoutUser = async (): Promise<ApiResponse<null>> => {
  const res = await api.get<ApiResponse<null>>('/api/auth/logout');
  return res.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const res = await api.get<ApiResponse<User>>('/api/auth/me');
  return res.data.data;
};
