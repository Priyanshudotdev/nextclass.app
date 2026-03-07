// ============================================
// NextClass Types
// ============================================

// User & Auth
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  instituteId: string;
  name: string;
  email: string;
  address: string;
  state: string;
  city: string;
  role: UserRole;
  status?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends Omit<User, 'password'> {}

// Institute
export interface Institute {
  id: string;
  name: string;
  logo?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  createdAt: string;
  updatedAt: string;
}

// Course
export interface Course {
  id: string;
  instituteId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Batch
export interface Batch {
  id: string;
  instituteId: string;
  courseId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status?: string;
  isDeleted: boolean;
  course?: Course;
  createdAt: string;
  updatedAt: string;
}

// Subject
export interface Subject {
  id: string;
  instituteId: string;
  courseId: string;
  name: string;
  course?: Course;
  createdAt: string;
  updatedAt: string;
}

// Unit
export interface Unit {
  id: string;
  instituteId: string;
  subjectId: string;
  name: string;
  description?: string;
  orderIndex: number;
  subject?: Subject;
  createdAt: string;
  updatedAt: string;
}

// Enrollment
export interface Enrollment {
  id: string;
  instituteId: string;
  studentId: string;
  batchId: string;
  status?: string;
  student?: User;
  batch?: Batch;
  createdAt: string;
  updatedAt: string;
}

// Attendance
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface Attendance {
  id: string;
  instituteId: string;
  studentId: string;
  batchId: string;
  subjectId?: string;
  date: string;
  status: AttendanceStatus;
  student?: User;
  batch?: Batch;
  subject?: Subject;
  createdAt: string;
}

// Chat
export type ChatRoomType = 'DISCUSSION' | 'RESOURCE';
export type MessageType = 'TEXT' | 'FILE' | 'IMAGE';

export interface ChatRoom {
  id: string;
  instituteId: string;
  batchId: string;
  type: ChatRoomType;
  name?: string;
  batch?: Batch;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  fileUrl?: string;
  isAnnouncement: boolean;
  isPinned: boolean;
  pinnedAt?: string;
  sender?: User;
  chatRoom?: ChatRoom;
  createdAt: string;
}

// Resource
export interface Resource {
  id: string;
  instituteId: string;
  batchId: string;
  subjectId?: string;
  unitId?: string;
  uploadedBy: string;
  title: string;
  fileUrl: string;
  description?: string;
  fileType?: string;
  batch?: Batch;
  subject?: Subject;
  unit?: Unit;
  teacher?: User;
  createdAt: string;
}

// Notification
export type NotificationType =
  | 'RESOURCE'
  | 'MESSAGE'
  | 'ATTENDANCE'
  | 'ENROLLMENT'
  | 'ANNOUNCEMENT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  entityId?: string;
  createdAt: string;
}

// Parent-Student Link
export interface ParentStudent {
  id: string;
  parentId: string;
  studentId: string;
  parent?: User;
  student?: User;
}

// Audit Log
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  user?: User;
  createdAt: string;
}

// Teacher Subject Assignment
export interface TeacherSubject {
  id: string;
  instituteId: string;
  teacherId: string;
  subjectId: string;
  batchId: string;
  teacher?: User;
  subject?: Subject;
}

// ============================================
// API Response Types
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// ============================================
// Dashboard Stats Types
// ============================================

export interface AdminDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  activeCourses: number;
  activeBatches: number;
  todayAttendancePercentage: number;
  monthlyEnrollments: { month: string; count: number }[];
  weeklyAttendance: { day: string; present: number; absent: number }[];
}

export interface TeacherDashboardStats {
  assignedBatches: number;
  totalStudents: number;
  pendingAttendance: number;
  resourcesUploaded: number;
}

export interface StudentDashboardStats {
  enrolledCourses: number;
  attendancePercentage: number;
  totalResources: number;
  unreadAnnouncements: number;
}

// ============================================
// Activity Types
// ============================================

export type ActivityType =
  | 'STUDENT_JOIN'
  | 'RESOURCE_UPLOAD'
  | 'ATTENDANCE'
  | 'ANNOUNCEMENT'
  | 'ENROLLMENT';

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  user?: {
    id: string;
    name: string;
  };
  timestamp: string;
}

// ============================================
// Navigation Types
// ============================================

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  roles?: UserRole[];
  badge?: number;
}
