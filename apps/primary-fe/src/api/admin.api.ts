import api from '@/lib/axios';

// ============================================
// Types
// ============================================

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  status: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  status: string;
  courseId: string;
  course: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  courseId: string;
  course: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  id: string;
  status: string;
  student: { id: string; name: string; email: string };
  batch: {
    id: string;
    name: string;
    course: { id: string; name: string };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  student: { id: string; name: string; email: string };
  batch: { id: string; name: string };
  subject?: { id: string; name: string } | null;
  createdAt: string;
}

export interface Resource {
  id: string;
  title: string;
  description?: string | null;
  fileUrl: string;
  fileType?: string | null;
  batch: { id: string; name: string };
  subject?: { id: string; name: string } | null;
  teacher: { id: string; name: string };
  createdAt: string;
}

// ============================================
// Input Types
// ============================================

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: 'TEACHER' | 'STUDENT' | 'PARENT';
  address?: string;
  city?: string;
  state?: string;
  status?: string;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  status?: string;
}

export interface CreateCourseInput {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status?: string;
}

export interface UpdateCourseInput {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface CreateBatchInput {
  courseId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status?: string;
}

export interface UpdateBatchInput {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}

export interface CreateSubjectInput {
  courseId: string;
  name: string;
}

export interface UpdateSubjectInput {
  name?: string;
}

export interface CreateEnrollmentInput {
  studentId: string;
  batchId: string;
}

export interface CreateAttendanceInput {
  studentId: string;
  batchId: string;
  subjectId?: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
}

export interface CreateResourceInput {
  batchId: string;
  subjectId?: string;
  title: string;
  fileUrl: string;
  description?: string;
  fileType?: string;
}

// ============================================
// Query Params
// ============================================

export interface UserQueryParams {
  q?: string;
  status?: string;
  includeDeleted?: boolean;
}

export interface CourseQueryParams {
  q?: string;
  status?: string;
  includeDeleted?: boolean;
}

export interface BatchQueryParams {
  q?: string;
  courseId?: string;
  status?: string;
  includeDeleted?: boolean;
}

export interface AttendanceQueryParams {
  batchId?: string;
  studentId?: string;
  date?: string;
}

export interface ResourceQueryParams {
  batchId?: string;
  subjectId?: string;
}

// ============================================
// API Response Type
// ============================================

interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ============================================
// API Functions
// ============================================

// Dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await api.get<ApiResponse<DashboardStats>>(
    '/api/admin/dashboard',
  );
  return res.data.data;
}

// Students
export async function getStudents(params?: UserQueryParams): Promise<User[]> {
  const res = await api.get<ApiResponse<User[]>>('/api/admin/students', {
    params,
  });
  return res.data.data;
}

// Teachers
export async function getTeachers(params?: UserQueryParams): Promise<User[]> {
  const res = await api.get<ApiResponse<User[]>>('/api/admin/teachers', {
    params,
  });
  return res.data.data;
}

// Users CRUD
export async function createUser(input: CreateUserInput): Promise<User> {
  const res = await api.post<ApiResponse<User>>('/api/admin/users', input);
  return res.data.data;
}

export async function updateUser(
  userId: string,
  input: UpdateUserInput,
): Promise<User> {
  const res = await api.patch<ApiResponse<User>>(
    `/api/admin/users/${userId}`,
    input,
  );
  return res.data.data;
}

export async function deleteUser(userId: string): Promise<void> {
  await api.delete(`/api/admin/users/${userId}`);
}

// Courses CRUD
export async function getCourses(
  params?: CourseQueryParams,
): Promise<Course[]> {
  const res = await api.get<ApiResponse<Course[]>>('/api/admin/courses', {
    params,
  });
  return res.data.data;
}

export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const res = await api.post<ApiResponse<Course>>('/api/admin/courses', input);
  return res.data.data;
}

export async function updateCourse(
  courseId: string,
  input: UpdateCourseInput,
): Promise<Course> {
  const res = await api.patch<ApiResponse<Course>>(
    `/api/admin/courses/${courseId}`,
    input,
  );
  return res.data.data;
}

export async function deleteCourse(courseId: string): Promise<void> {
  await api.delete(`/api/admin/courses/${courseId}`);
}

// Batches CRUD
export async function getBatches(params?: BatchQueryParams): Promise<Batch[]> {
  const res = await api.get<ApiResponse<Batch[]>>('/api/admin/batches', {
    params,
  });
  return res.data.data;
}

export async function createBatch(input: CreateBatchInput): Promise<Batch> {
  const res = await api.post<ApiResponse<Batch>>('/api/admin/batches', input);
  return res.data.data;
}

export async function updateBatch(
  batchId: string,
  input: UpdateBatchInput,
): Promise<Batch> {
  const res = await api.patch<ApiResponse<Batch>>(
    `/api/admin/batches/${batchId}`,
    input,
  );
  return res.data.data;
}

export async function deleteBatch(batchId: string): Promise<void> {
  await api.delete(`/api/admin/batches/${batchId}`);
}

// Subjects CRUD
export async function getSubjects(): Promise<Subject[]> {
  const res = await api.get<ApiResponse<Subject[]>>('/api/admin/subjects');
  return res.data.data;
}

export async function createSubject(
  input: CreateSubjectInput,
): Promise<Subject> {
  const res = await api.post<ApiResponse<Subject>>(
    '/api/admin/subjects',
    input,
  );
  return res.data.data;
}

export async function updateSubject(
  subjectId: string,
  input: UpdateSubjectInput,
): Promise<Subject> {
  const res = await api.patch<ApiResponse<Subject>>(
    `/api/admin/subjects/${subjectId}`,
    input,
  );
  return res.data.data;
}

export async function deleteSubject(subjectId: string): Promise<void> {
  await api.delete(`/api/admin/subjects/${subjectId}`);
}

// Enrollments
export async function getEnrollments(): Promise<Enrollment[]> {
  const res = await api.get<ApiResponse<Enrollment[]>>(
    '/api/admin/enrollments',
  );
  return res.data.data;
}

export async function createEnrollment(
  input: CreateEnrollmentInput,
): Promise<Enrollment> {
  const res = await api.post<ApiResponse<Enrollment>>(
    '/api/admin/enrollments',
    input,
  );
  return res.data.data;
}

export async function deleteEnrollment(enrollmentId: string): Promise<void> {
  await api.delete(`/api/admin/enrollments/${enrollmentId}`);
}

// Attendance
export async function getAttendance(
  params?: AttendanceQueryParams,
): Promise<Attendance[]> {
  const res = await api.get<ApiResponse<Attendance[]>>(
    '/api/admin/attendance',
    { params },
  );
  return res.data.data;
}

export async function createAttendance(
  input: CreateAttendanceInput,
): Promise<Attendance> {
  const res = await api.post<ApiResponse<Attendance>>(
    '/api/admin/attendance',
    input,
  );
  return res.data.data;
}

export async function updateAttendance(
  attendanceId: string,
  input: { status?: 'PRESENT' | 'ABSENT' | 'LATE'; date?: string },
): Promise<Attendance> {
  const res = await api.patch<ApiResponse<Attendance>>(
    `/api/admin/attendance/${attendanceId}`,
    input,
  );
  return res.data.data;
}

export async function deleteAttendance(attendanceId: string): Promise<void> {
  await api.delete(`/api/admin/attendance/${attendanceId}`);
}

// Resources
export async function getResources(
  params?: ResourceQueryParams,
): Promise<Resource[]> {
  const res = await api.get<ApiResponse<Resource[]>>('/api/admin/resources', {
    params,
  });
  return res.data.data;
}

export async function createResource(
  input: CreateResourceInput,
): Promise<Resource> {
  const res = await api.post<ApiResponse<Resource>>(
    '/api/admin/resources',
    input,
  );
  return res.data.data;
}

// ============================================
// Teacher Assignments
// ============================================

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  subjectId: string;
  batchId: string;
  teacher: { id: string; name: string; email: string };
  subject: { id: string; name: string };
}

export interface CreateTeacherAssignmentInput {
  teacherId: string;
  subjectId: string;
  batchId: string;
}

export interface TeacherAssignmentQueryParams {
  batchId?: string;
  teacherId?: string;
  subjectId?: string;
}

export async function getTeacherAssignments(
  params?: TeacherAssignmentQueryParams,
): Promise<TeacherAssignment[]> {
  const res = await api.get<ApiResponse<TeacherAssignment[]>>(
    '/api/admin/teacher-assignments',
    { params },
  );
  return res.data.data;
}

export async function createTeacherAssignment(
  input: CreateTeacherAssignmentInput,
): Promise<TeacherAssignment> {
  const res = await api.post<ApiResponse<TeacherAssignment>>(
    '/api/admin/teacher-assignments',
    input,
  );
  return res.data.data;
}

export async function deleteTeacherAssignment(
  assignmentId: string,
): Promise<void> {
  await api.delete(`/api/admin/teacher-assignments/${assignmentId}`);
}

// ============================================
// ChatRooms (Admin)
// ============================================

export interface ChatRoom {
  id: string;
  name: string;
  type: string;
  batch: { id: string; name: string };
  createdAt: string;
}

export interface CreateChatRoomInput {
  batchId: string;
  name: string;
  type?: string;
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  const res = await api.get<ApiResponse<ChatRoom[]>>('/api/admin/chatrooms');
  return res.data.data;
}

export async function createChatRoom(
  input: CreateChatRoomInput,
): Promise<ChatRoom> {
  const res = await api.post<ApiResponse<ChatRoom>>(
    '/api/admin/chatrooms',
    input,
  );
  return res.data.data;
}
