import { Prisma } from 'db';

export type ServiceErrorCode =
  | 'NOT_FOUND'
  | 'ALREADY_EXISTS'
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR';

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: ServiceErrorCode };

export function ok<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

export function fail(error: string, code: ServiceErrorCode): ServiceResult<never> {
  return { success: false, error, code };
}

export const profileSelect = {
  id: true,
  email: true,
  name: true,
  address: true,
  city: true,
  state: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export const childSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export const enrollmentSelect = {
  id: true,
  createdAt: true,
  batch: {
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      course: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.EnrollmentSelect;

export const attendanceSelect = {
  id: true,
  date: true,
  status: true,
  batch: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true } },
} satisfies Prisma.AttendanceSelect;

export const subjectSelect = {
  id: true,
  name: true,
} satisfies Prisma.SubjectSelect;

export const resourceSelect = {
  id: true,
  title: true,
  description: true,
  fileUrl: true,
  fileType: true,
  createdAt: true,
  teacher: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true } },
  unit: { select: { id: true, name: true } },
} satisfies Prisma.ResourceSelect;

export const teacherSelect = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect;

export const notificationSelect = {
  id: true,
  type: true,
  title: true,
  message: true,
  isRead: true,
  entityId: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

export type ProfileRow = Prisma.UserGetPayload<{ select: typeof profileSelect }>;
export type ChildRow = Prisma.UserGetPayload<{ select: typeof childSelect }>;
export type EnrollmentRow = Prisma.EnrollmentGetPayload<{ select: typeof enrollmentSelect }>;
export type AttendanceRow = Prisma.AttendanceGetPayload<{ select: typeof attendanceSelect }>;
export type SubjectRow = Prisma.SubjectGetPayload<{ select: typeof subjectSelect }>;
export type ResourceRow = Prisma.ResourceGetPayload<{ select: typeof resourceSelect }>;
export type TeacherRow = Prisma.UserGetPayload<{ select: typeof teacherSelect }>;
export type NotificationRow = Prisma.NotificationGetPayload<{ select: typeof notificationSelect }>;

export interface UpdateProfileInput {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface AttendanceQueryParams {
  batchId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface ChildSummary {
  child: {
    id: string;
    name: string;
    email: string;
  };
  enrollments: {
    total: number;
    active: number;
    batches: Array<{ id: string; name: string; courseName: string }>;
  };
  attendance: {
    present: number;
    absent: number;
    late: number;
    percentage: number;
  };
  recentResources: number;
  unreadNotifications: number;
}
