import { Prisma } from 'db';
import { AttendanceStatus, MessageType } from 'db';

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

export const assignmentSelect = {
  id: true,
  batchId: true,
  subjectId: true,
  subject: {
    select: {
      id: true,
      name: true,
      course: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.TeacherSubjectSelect;

export const batchSelect = {
  id: true,
  name: true,
  description: true,
  startDate: true,
  endDate: true,
  status: true,
  course: { select: { id: true, name: true } },
  _count: { select: { enrollments: true } },
} satisfies Prisma.BatchSelect;

export const studentSelect = {
  id: true,
  name: true,
  email: true,
  status: true,
} satisfies Prisma.UserSelect;

export const attendanceSelect = {
  id: true,
  date: true,
  status: true,
  student: { select: { id: true, name: true } },
  batch: { select: { id: true, name: true } },
  subject: { select: { id: true, name: true } },
  createdAt: true,
} satisfies Prisma.AttendanceSelect;

export const resourceSelect = {
  id: true,
  title: true,
  description: true,
  fileUrl: true,
  fileType: true,
  batch: { select: { id: true, name: true, course: { select: { id: true, name: true } } } },
  subject: { select: { id: true, name: true } },
  unit: { select: { id: true, name: true } },
  createdAt: true,
} satisfies Prisma.ResourceSelect;

export const unitSelect = {
  id: true,
  name: true,
  description: true,
  orderIndex: true,
  subjectId: true,
  _count: { select: { resources: true } },
  createdAt: true,
} satisfies Prisma.UnitSelect;

export const chatRoomSelect = {
  id: true,
  name: true,
  type: true,
  messagingMode: true,
  batch: { select: { id: true, name: true, course: { select: { id: true, name: true } } } },
  createdAt: true,
} satisfies Prisma.ChatRoomSelect;

export const notificationSelect = {
  id: true,
  type: true,
  title: true,
  message: true,
  isRead: true,
  entityId: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

export const chatMessageSelect = {
  id: true,
  content: true,
  messageType: true,
  fileUrl: true,
  isAnnouncement: true,
  isPinned: true,
  pinnedAt: true,
  sender: { select: { id: true, name: true, role: true } },
  createdAt: true,
} satisfies Prisma.ChatMessageSelect;

export type ProfileRow = Prisma.UserGetPayload<{ select: typeof profileSelect }>;
export type AssignmentRow = Prisma.TeacherSubjectGetPayload<{ select: typeof assignmentSelect }>;
export type BatchRow = Prisma.BatchGetPayload<{ select: typeof batchSelect }>;
export type StudentRow = Prisma.UserGetPayload<{ select: typeof studentSelect }>;
export type AttendanceRow = Prisma.AttendanceGetPayload<{ select: typeof attendanceSelect }>;
export type ResourceRow = Prisma.ResourceGetPayload<{ select: typeof resourceSelect }>;
export type UnitRow = Prisma.UnitGetPayload<{ select: typeof unitSelect }>;
export type ChatRoomRow = Prisma.ChatRoomGetPayload<{ select: typeof chatRoomSelect }>;
export type ChatMessageRow = Prisma.ChatMessageGetPayload<{ select: typeof chatMessageSelect }>;
export type NotificationRow = Prisma.NotificationGetPayload<{ select: typeof notificationSelect }>;

export interface UpdateProfileInput {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
}

export interface MarkAttendanceInput {
  studentId: string;
  batchId: string;
  subjectId?: string;
  date: Date;
  status: AttendanceStatus;
}

export interface BulkAttendanceInput {
  batchId: string;
  subjectId?: string;
  date: Date;
  records: { studentId: string; status: AttendanceStatus }[];
}

export interface CreateResourceInput {
  batchId: string;
  subjectId?: string;
  unitId?: string;
  title: string;
  fileUrl: string;
  description?: string;
  fileType?: string;
}

export interface UpdateResourceInput {
  title?: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  unitId?: string;
}

export interface CreateUnitInput {
  subjectId: string;
  name: string;
  description?: string;
  orderIndex?: number;
}

export interface UpdateUnitInput {
  name?: string;
  description?: string;
  orderIndex?: number;
}

export interface SendMessageInput {
  content: string;
  messageType?: MessageType;
  fileUrl?: string;
  isAnnouncement?: boolean;
}

export type UpdateProfileRequest = {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
};

export type MarkAttendanceRequest = {
  studentId: string;
  batchId: string;
  subjectId?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
};

export type BulkAttendanceRequest = {
  batchId: string;
  subjectId?: string;
  date: string;
  records: { studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }[];
};

export type CreateResourceRequest = {
  batchId: string;
  subjectId?: string;
  unitId?: string;
  title: string;
  fileUrl: string;
  description?: string;
  fileType?: string;
};

export type UpdateResourceRequest = {
  title?: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
  unitId?: string;
};

export type CreateUnitRequest = {
  subjectId: string;
  name: string;
  description?: string;
  orderIndex?: number;
};

export type UpdateUnitRequest = {
  name?: string;
  description?: string;
  orderIndex?: number;
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
  page?: string;
};

export type ResourceQueryParams = {
  title?: string;
  subjectId?: string;
  unitId?: string;
  fileType?: string;
  batchId?: string;
};

export type ReorderUnitsRequest = {
  units: { id: string; orderIndex: number }[];
};

export interface BatchSummary {
  batch: {
    id: string;
    name: string;
    courseName: string;
  };
  students: {
    total: number;
    active: number;
  };
  attendance: {
    todayPresent: number;
    todayAbsent: number;
    todayLate: number;
    overallPercentage: number;
  };
  resources: {
    total: number;
    recentWeek: number;
  };
  messages: {
    last24h: number;
  };
}
