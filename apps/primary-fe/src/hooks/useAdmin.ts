import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '@/api/admin.api';
import type {
  User,
  Course,
  Batch,
  Subject,
  Enrollment,
  Attendance,
  Resource,
  CreateUserInput,
  UpdateUserInput,
  CreateCourseInput,
  UpdateCourseInput,
  CreateBatchInput,
  UpdateBatchInput,
  CreateSubjectInput,
  UpdateSubjectInput,
  CreateEnrollmentInput,
  CreateAttendanceInput,
  CreateResourceInput,
  UserQueryParams,
  CourseQueryParams,
  BatchQueryParams,
  AttendanceQueryParams,
  ResourceQueryParams,
} from '@/api/admin.api';

// ============================================
// Query Keys
// ============================================

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  students: (params?: UserQueryParams) =>
    [...adminKeys.all, 'students', params] as const,
  teachers: (params?: UserQueryParams) =>
    [...adminKeys.all, 'teachers', params] as const,
  courses: (params?: CourseQueryParams) =>
    [...adminKeys.all, 'courses', params] as const,
  batches: (params?: BatchQueryParams) =>
    [...adminKeys.all, 'batches', params] as const,
  subjects: () => [...adminKeys.all, 'subjects'] as const,
  enrollments: () => [...adminKeys.all, 'enrollments'] as const,
  attendance: (params?: AttendanceQueryParams) =>
    [...adminKeys.all, 'attendance', params] as const,
  resources: (params?: ResourceQueryParams) =>
    [...adminKeys.all, 'resources', params] as const,
};

// ============================================
// Dashboard
// ============================================

export function useDashboardStats() {
  return useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: adminApi.getDashboardStats,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================
// Students
// ============================================

export function useStudents(params?: UserQueryParams) {
  return useQuery({
    queryKey: adminKeys.students(params),
    queryFn: () => adminApi.getStudents(params),
  });
}

// ============================================
// Teachers
// ============================================

export function useTeachers(params?: UserQueryParams) {
  return useQuery({
    queryKey: adminKeys.teachers(params),
    queryFn: () => adminApi.getTeachers(params),
  });
}

// ============================================
// User Mutations
// ============================================

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateUserInput) => adminApi.createUser(input),
    onSuccess: (newUser) => {
      // Invalidate the relevant query based on role
      if (newUser.role === 'STUDENT') {
        queryClient.invalidateQueries({ queryKey: adminKeys.students() });
      } else if (newUser.role === 'TEACHER') {
        queryClient.invalidateQueries({ queryKey: adminKeys.teachers() });
      }
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      input,
    }: {
      userId: string;
      input: UpdateUserInput;
    }) => adminApi.updateUser(userId, input),
    onSuccess: (updatedUser) => {
      if (updatedUser.role === 'STUDENT') {
        queryClient.invalidateQueries({ queryKey: adminKeys.students() });
      } else if (updatedUser.role === 'TEACHER') {
        queryClient.invalidateQueries({ queryKey: adminKeys.teachers() });
      }
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.students() });
      queryClient.invalidateQueries({ queryKey: adminKeys.teachers() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

// ============================================
// Courses
// ============================================

export function useCourses(params?: CourseQueryParams) {
  return useQuery({
    queryKey: adminKeys.courses(params),
    queryFn: () => adminApi.getCourses(params),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCourseInput) => adminApi.createCourse(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.courses() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      input,
    }: {
      courseId: string;
      input: UpdateCourseInput;
    }) => adminApi.updateCourse(courseId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.courses() });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => adminApi.deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.courses() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

// ============================================
// Batches
// ============================================

export function useBatches(params?: BatchQueryParams) {
  return useQuery({
    queryKey: adminKeys.batches(params),
    queryFn: () => adminApi.getBatches(params),
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBatchInput) => adminApi.createBatch(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.batches() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      batchId,
      input,
    }: {
      batchId: string;
      input: UpdateBatchInput;
    }) => adminApi.updateBatch(batchId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.batches() });
    },
  });
}

export function useDeleteBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) => adminApi.deleteBatch(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.batches() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

// ============================================
// Subjects
// ============================================

export function useSubjects() {
  return useQuery({
    queryKey: adminKeys.subjects(),
    queryFn: adminApi.getSubjects,
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSubjectInput) => adminApi.createSubject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subjects() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subjectId,
      input,
    }: {
      subjectId: string;
      input: UpdateSubjectInput;
    }) => adminApi.updateSubject(subjectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subjects() });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subjectId: string) => adminApi.deleteSubject(subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.subjects() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

// ============================================
// Enrollments
// ============================================

export function useEnrollments() {
  return useQuery({
    queryKey: adminKeys.enrollments(),
    queryFn: adminApi.getEnrollments,
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEnrollmentInput) =>
      adminApi.createEnrollment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.enrollments() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useDeleteEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) =>
      adminApi.deleteEnrollment(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.enrollments() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

// ============================================
// Attendance
// ============================================

export function useAttendance(params?: AttendanceQueryParams) {
  return useQuery({
    queryKey: adminKeys.attendance(params),
    queryFn: () => adminApi.getAttendance(params),
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAttendanceInput) =>
      adminApi.createAttendance(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.attendance() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attendanceId,
      input,
    }: {
      attendanceId: string;
      input: { status?: 'PRESENT' | 'ABSENT' | 'LATE'; date?: string };
    }) => adminApi.updateAttendance(attendanceId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.attendance() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attendanceId: string) =>
      adminApi.deleteAttendance(attendanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.attendance() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}

// ============================================
// Resources
// ============================================

export function useResources(params?: ResourceQueryParams) {
  return useQuery({
    queryKey: adminKeys.resources(params),
    queryFn: () => adminApi.getResources(params),
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateResourceInput) => adminApi.createResource(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.resources() });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard() });
    },
  });
}
