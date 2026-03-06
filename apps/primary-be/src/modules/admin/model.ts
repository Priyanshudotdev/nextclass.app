import { prisma, Prisma } from 'db';
import { AttendanceStatus, ChatRoomType, UserRole } from 'db';

export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: ServiceErrorCode };

export type ServiceErrorCode =
  | 'NOT_FOUND'
  | 'ALREADY_EXISTS'
  | 'VALIDATION_ERROR'
  | 'FORBIDDEN'
  | 'INTERNAL_ERROR';

export function ok<T>(data: T): ServiceResult<T> {
  return { success: true, data };
}

export function fail(error: string, code: ServiceErrorCode): ServiceResult<never> {
  return { success: false, error, code };
}

export const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  address: true,
  city: true,
  state: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export const courseSelect = {
  id: true,
  name: true,
  description: true,
  startDate: true,
  endDate: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CourseSelect;

export const batchSelect = {
  id: true,
  name: true,
  description: true,
  startDate: true,
  endDate: true,
  status: true,
  courseId: true,
  course: { select: { id: true, name: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BatchSelect;

export const subjectSelect = {
  id: true,
  name: true,
  courseId: true,
  course: { select: { id: true, name: true } },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SubjectSelect;

export const enrollmentSelect = {
  id: true,
  status: true,
  student: { select: { id: true, name: true, email: true } },
  batch: {
    select: {
      id: true,
      name: true,
      course: { select: { id: true, name: true } },
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EnrollmentSelect;

export const attendanceSelect = {
  id: true,
  date: true,
  status: true,
  student: { select: { id: true, name: true, email: true } },
  batch: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true } },
  createdAt: true,
} satisfies Prisma.AttendanceSelect;

export const chatRoomSelect = {
  id: true,
  name: true,
  type: true,
  batch: { select: { id: true, name: true } },
  createdAt: true,
} satisfies Prisma.ChatRoomSelect;

export const resourceSelect = {
  id: true,
  title: true,
  description: true,
  fileUrl: true,
  fileType: true,
  batch: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true } },
  teacher: { select: { id: true, name: true } },
  createdAt: true,
} satisfies Prisma.ResourceSelect;

export type UserRow = Prisma.UserGetPayload<{ select: typeof userSelect }>;
export type CourseRow = Prisma.CourseGetPayload<{ select: typeof courseSelect }>;
export type BatchRow = Prisma.BatchGetPayload<{ select: typeof batchSelect }>;
export type SubjectRow = Prisma.SubjectGetPayload<{ select: typeof subjectSelect }>;
export type EnrollmentRow = Prisma.EnrollmentGetPayload<{ select: typeof enrollmentSelect }>;
export type AttendanceRow = Prisma.AttendanceGetPayload<{ select: typeof attendanceSelect }>;
export type ChatRoomRow = Prisma.ChatRoomGetPayload<{ select: typeof chatRoomSelect }>;
export type ResourceRow = Prisma.ResourceGetPayload<{ select: typeof resourceSelect }>;

export interface CreateCourseInput {
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  status?: string;
}

export interface UpdateCourseInput {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

export interface CreateBatchInput {
  courseId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  status?: string;
}

export interface UpdateBatchInput {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
}

export interface CreateSubjectInput {
  courseId: string;
  name: string;
}

export interface UpdateSubjectInput {
  name?: string;
}

export interface AttendanceFilters {
  batchId?: string;
  studentId?: string;
  date?: Date;
}

export interface CreateAttendanceInput {
  studentId: string;
  batchId: string;
  subjectId?: string;
  date: Date;
  status: AttendanceStatus;
}

export interface UpdateAttendanceInput {
  status?: AttendanceStatus;
  date?: Date;
}

export interface CreateChatRoomInput {
  batchId: string;
  type: ChatRoomType;
  name?: string;
}

export interface CreateResourceInput {
  batchId: string;
  subjectId?: string;
  title: string;
  fileUrl: string;
  description?: string;
  fileType?: string;
}

export type CreateCourseRequest = {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status?: string;
};

export type UpdateCourseRequest = Partial<CreateCourseRequest>;

export type CreateBatchRequest = {
  courseId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status?: string;
};

export type UpdateBatchRequest = Partial<Omit<CreateBatchRequest, 'courseId'>>;

export type CreateSubjectRequest = {
  courseId: string;
  name: string;
};

export type UpdateSubjectRequest = {
  name?: string;
};

export type CreateAttendanceRequest = {
  studentId: string;
  batchId: string;
  subjectId?: string;
  date: string;
  status: AttendanceStatus;
};

export type UpdateAttendanceRequest = {
  status?: AttendanceStatus;
  date?: string;
};

export type AttendanceQueryParams = {
  batchId?: string;
  studentId?: string;
  date?: string;
};

export type CreateChatRoomRequest = {
  batchId: string;
  type: ChatRoomType;
  name?: string;
};

export type CreateResourceRequest = {
  batchId: string;
  subjectId?: string;
  title: string;
  fileUrl: string;
  description?: string;
  fileType?: string;
};

export type CreateEnrollmentRequest = {
  studentId: string;
  batchId: string;
  status?: string;
};

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  address: string;
  city: string;
  state: string;
  role: UserRole;
  status?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  role?: UserRole;
  status?: string;
}

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  address: string;
  city: string;
  state: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  status?: string;
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  role?: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  status?: string;
};

export const parentStudentSelect = {
  id: true,
  parent: { select: { id: true, name: true, email: true } },
  student: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ParentStudentSelect;

export type ParentStudentRow = Prisma.ParentStudentGetPayload<{
  select: typeof parentStudentSelect;
}>;

export type LinkParentStudentRequest = {
  parentId: string;
  studentId: string;
};

export interface EnrollmentFilters {
  batchId?: string;
  studentId?: string;
}

export interface DashboardStats {
  users: {
    total: number;
    students: number;
    teachers: number;
    parents: number;
    admins: number;
  };
  courses: number;
  batches: number;
  subjects: number;
  enrollments: number;
  attendanceToday: {
    present: number;
    absent: number;
    late: number;
    total: number;
  };
  recentActivity: {
    newEnrollments: number;
    newResources: number;
    messagesLast24h: number;
  };
}

// Search & Filter Query Params
export interface UserQueryParams {
  q?: string; // Search by name or email
  role?: string;
  status?: string;
  includeDeleted?: string; // 'true' to include soft-deleted
}

export interface CourseQueryParams {
  q?: string; // Search by name
  status?: string;
  includeDeleted?: string;
}

export interface BatchQueryParams {
  q?: string; // Search by name
  courseId?: string;
  status?: string;
  includeDeleted?: string;
}

export interface SubjectQueryParams {
  q?: string;
  courseId?: string;
}

// Audit log types
export const auditLogSelect = {
  id: true,
  action: true,
  entityType: true,
  entityId: true,
  changes: true,
  ipAddress: true,
  user: { select: { id: true, name: true, email: true } },
  createdAt: true,
} satisfies Prisma.AuditLogSelect;

export type AuditLogRow = Prisma.AuditLogGetPayload<{ select: typeof auditLogSelect }>;

export interface AuditLogQueryParams {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  from?: string;
  to?: string;
}
