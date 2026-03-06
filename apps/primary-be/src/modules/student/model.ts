import { Prisma } from 'db';
import { MessageType } from 'db';

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

export const profileSelect = {
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

export const enrollmentSelect = {
  id: true,
  status: true,
  batch: {
    select: {
      id: true,
      name: true,
      description: true,
      startDate: true,
      endDate: true,
      status: true,
      course: {
        select: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  },
  createdAt: true,
} satisfies Prisma.EnrollmentSelect;

export const attendanceSelect = {
  id: true,
  date: true,
  status: true,
  batch: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true } },
  createdAt: true,
} satisfies Prisma.AttendanceSelect;

export const subjectSelect = {
  id: true,
  name: true,
  courseId: true,
  createdAt: true,
} satisfies Prisma.SubjectSelect;

export const resourceSelect = {
  id: true,
  title: true,
  description: true,
  fileUrl: true,
  fileType: true,
  subject: { select: { id: true, name: true } },
  teacher: { select: { id: true, name: true } },
  createdAt: true,
} satisfies Prisma.ResourceSelect;

export const chatRoomSelect = {
  id: true,
  name: true,
  type: true,
  batch: { select: { id: true, name: true } },
  createdAt: true,
} satisfies Prisma.ChatRoomSelect;

export const chatMessageSelect = {
  id: true,
  content: true,
  messageType: true,
  fileUrl: true,
  sender: { select: { id: true, name: true } },
  createdAt: true,
} satisfies Prisma.ChatMessageSelect;

export type ProfileRow = Prisma.UserGetPayload<{ select: typeof profileSelect }>;
export type EnrollmentRow = Prisma.EnrollmentGetPayload<{ select: typeof enrollmentSelect }>;
export type AttendanceRow = Prisma.AttendanceGetPayload<{ select: typeof attendanceSelect }>;
export type SubjectRow = Prisma.SubjectGetPayload<{ select: typeof subjectSelect }>;
export type ResourceRow = Prisma.ResourceGetPayload<{ select: typeof resourceSelect }>;
export type ChatRoomRow = Prisma.ChatRoomGetPayload<{ select: typeof chatRoomSelect }>;
export type ChatMessageRow = Prisma.ChatMessageGetPayload<{ select: typeof chatMessageSelect }>;

export interface UpdateProfileInput {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface AttendanceFilters {
  batchId?: string;
  subjectId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface SendMessageInput {
  content: string;
  messageType?: MessageType;
  fileUrl?: string;
}

export type UpdateProfileRequest = {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
};

export type SendMessageRequest = {
  content: string;
  messageType?: 'TEXT' | 'FILE' | 'IMAGE';
  fileUrl?: string;
};

export type AttendanceQueryParams = {
  batchId?: string;
  subjectId?: string;
  startDate?: string;
  endDate?: string;
};

export type MessagesQueryParams = {
  limit?: string;
  before?: string;
};

export interface StudentDashboard {
  profile: {
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
  upcomingClasses: number;
  unreadMessages: number;
  recentResources: number;
}
