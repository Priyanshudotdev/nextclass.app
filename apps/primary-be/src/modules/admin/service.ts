import { Request, Response } from 'express';
import {
  prisma,
  UserRole,
  AttendanceStatus,
  MessagePermission,
  MessageType,
  NotificationType,
} from 'db';
import bcrypt from 'bcryptjs';
import * as Model from './model';
import { publishChatMessageEvent } from '../../lib/realtime-events';

const HTTP_STATUS: Record<Model.ServiceErrorCode, number> = {
  NOT_FOUND: 404,
  ALREADY_EXISTS: 409,
  VALIDATION_ERROR: 400,
  FORBIDDEN: 403,
  INTERNAL_ERROR: 500,
};

function send<T>(res: Response, result: Model.ServiceResult<T>, successStatus = 200): Response {
  if (!result.success) {
    return res.status(HTTP_STATUS[result.code]).json({ error: result.error });
  }
  return res.status(successStatus).json({ data: result.data });
}

async function svcGetDashboardStats(
  instituteId: string
): Promise<Model.ServiceResult<Model.DashboardStats>> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);

    const [
      totalUsers,
      students,
      teachers,
      parents,
      admins,
      courses,
      batches,
      subjects,
      enrollments,
      attendancePresent,
      attendanceAbsent,
      attendanceLate,
      newEnrollments,
      newResources,
      messagesLast24h,
    ] = await Promise.all([
      prisma.user.count({ where: { instituteId, isDeleted: false } }),
      prisma.user.count({ where: { instituteId, role: UserRole.STUDENT, isDeleted: false } }),
      prisma.user.count({ where: { instituteId, role: UserRole.TEACHER, isDeleted: false } }),
      prisma.user.count({ where: { instituteId, role: UserRole.PARENT, isDeleted: false } }),
      prisma.user.count({ where: { instituteId, role: UserRole.ADMIN, isDeleted: false } }),
      prisma.course.count({ where: { instituteId } }),
      prisma.batch.count({ where: { instituteId } }),
      prisma.subject.count({ where: { instituteId } }),
      prisma.enrollment.count({ where: { instituteId } }),
      prisma.attendance.count({
        where: { instituteId, date: today, status: AttendanceStatus.PRESENT },
      }),
      prisma.attendance.count({
        where: { instituteId, date: today, status: AttendanceStatus.ABSENT },
      }),
      prisma.attendance.count({
        where: { instituteId, date: today, status: AttendanceStatus.LATE },
      }),
      prisma.enrollment.count({
        where: { instituteId, createdAt: { gte: last7Days } },
      }),
      prisma.resource.count({
        where: { instituteId, createdAt: { gte: last7Days } },
      }),
      prisma.chatMessage.count({
        where: {
          chatRoom: { instituteId },
          createdAt: { gte: yesterday },
        },
      }),
    ]);

    return Model.ok({
      users: {
        total: totalUsers,
        students,
        teachers,
        parents,
        admins,
      },
      courses,
      batches,
      subjects,
      enrollments,
      attendanceToday: {
        present: attendancePresent,
        absent: attendanceAbsent,
        late: attendanceLate,
        total: attendancePresent + attendanceAbsent + attendanceLate,
      },
      recentActivity: {
        newEnrollments,
        newResources,
        messagesLast24h,
      },
    });
  } catch {
    return Model.fail('Failed to fetch dashboard stats', 'INTERNAL_ERROR');
  }
}

async function svcGetStudents(
  instituteId: string,
  params: Model.UserQueryParams = {}
): Promise<Model.ServiceResult<Model.UserRow[]>> {
  try {
    const { q, status, includeDeleted } = params;
    return Model.ok(
      await prisma.user.findMany({
        where: {
          instituteId,
          role: UserRole.STUDENT,
          isDeleted: includeDeleted === 'true' ? undefined : false,
          ...(status && { status }),
          ...(q && {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }),
        },
        select: Model.userSelect,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch students', 'INTERNAL_ERROR');
  }
}

async function svcGetTeachers(
  instituteId: string,
  params: Model.UserQueryParams = {}
): Promise<Model.ServiceResult<Model.UserRow[]>> {
  try {
    const { q, status, includeDeleted } = params;
    return Model.ok(
      await prisma.user.findMany({
        where: {
          instituteId,
          role: UserRole.TEACHER,
          isDeleted: includeDeleted === 'true' ? undefined : false,
          ...(status && { status }),
          ...(q && {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }),
        },
        select: Model.userSelect,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch teachers', 'INTERNAL_ERROR');
  }
}

async function svcGetUserById(
  userId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.UserRow>> {
  try {
    const data = await prisma.user.findFirst({
      where: { id: userId, instituteId, isDeleted: false },
      select: Model.userSelect,
    });
    return data ? Model.ok(data) : Model.fail('User not found', 'NOT_FOUND');
  } catch {
    return Model.fail('Failed to fetch user', 'INTERNAL_ERROR');
  }
}

async function svcCreateUser(
  instituteId: string,
  input: Model.CreateUserInput
): Promise<Model.ServiceResult<Model.UserRow>> {
  if (!input.name?.trim()) return Model.fail('Name is required', 'VALIDATION_ERROR');
  if (!input.email?.trim()) return Model.fail('Email is required', 'VALIDATION_ERROR');
  if (!input.password?.trim()) return Model.fail('Password is required', 'VALIDATION_ERROR');
  try {
    const existing = await prisma.user.findFirst({
      where: { email: input.email, instituteId },
    });
    if (existing) return Model.fail('User with this email already exists', 'ALREADY_EXISTS');
    const hashedPassword = await bcrypt.hash(input.password, 10);
    return Model.ok(
      await prisma.user.create({
        data: {
          instituteId,
          name: input.name,
          email: input.email,
          password: hashedPassword,
          address: input.address,
          city: input.city,
          state: input.state,
          role: input.role,
          status: input.status,
        },
        select: Model.userSelect,
      })
    );
  } catch {
    return Model.fail('Failed to create user', 'INTERNAL_ERROR');
  }
}

async function svcUpdateUser(
  userId: string,
  instituteId: string,
  input: Model.UpdateUserInput
): Promise<Model.ServiceResult<Model.UserRow>> {
  if (input.name !== undefined && !input.name.trim())
    return Model.fail('Name cannot be empty', 'VALIDATION_ERROR');
  if (input.email !== undefined && !input.email.trim())
    return Model.fail('Email cannot be empty', 'VALIDATION_ERROR');
  try {
    if (input.email) {
      const existing = await prisma.user.findFirst({
        where: { email: input.email, instituteId, id: { not: userId } },
      });
      if (existing) return Model.fail('Email already in use by another user', 'ALREADY_EXISTS');
    }
    const result = await prisma.user.updateMany({
      where: { id: userId, instituteId, isDeleted: false },
      data: input,
    });
    if (result.count === 0) return Model.fail('User not found', 'NOT_FOUND');
    const updated = await prisma.user.findFirst({
      where: { id: userId, instituteId },
      select: Model.userSelect,
    });
    return Model.ok(updated!);
  } catch {
    return Model.fail('Failed to update user', 'INTERNAL_ERROR');
  }
}

async function svcDeleteUser(
  userId: string,
  instituteId: string
): Promise<Model.ServiceResult<null>> {
  try {
    const result = await prisma.user.updateMany({
      where: { id: userId, instituteId, isDeleted: false },
      data: { isDeleted: true },
    });
    return result.count === 0 ? Model.fail('User not found', 'NOT_FOUND') : Model.ok(null);
  } catch {
    return Model.fail('Failed to delete user', 'INTERNAL_ERROR');
  }
}

async function svcGetCourses(
  instituteId: string,
  params: Model.CourseQueryParams = {}
): Promise<Model.ServiceResult<Model.CourseRow[]>> {
  try {
    const { q, status, includeDeleted } = params;
    return Model.ok(
      await prisma.course.findMany({
        where: {
          instituteId,
          isDeleted: includeDeleted === 'true' ? undefined : false,
          ...(status && { status }),
          ...(q && { name: { contains: q, mode: 'insensitive' } }),
        },
        select: Model.courseSelect,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch courses', 'INTERNAL_ERROR');
  }
}

async function svcGetCourseById(
  courseId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.CourseRow>> {
  try {
    const data = await prisma.course.findFirst({
      where: { id: courseId, instituteId },
      select: Model.courseSelect,
    });
    return data ? Model.ok(data) : Model.fail('Course not found', 'NOT_FOUND');
  } catch {
    return Model.fail('Failed to fetch course', 'INTERNAL_ERROR');
  }
}

async function svcCreateCourse(
  instituteId: string,
  input: Model.CreateCourseInput
): Promise<Model.ServiceResult<Model.CourseRow>> {
  if (!input.name?.trim()) return Model.fail('Course name is required', 'VALIDATION_ERROR');
  try {
    return Model.ok(
      await prisma.course.create({ data: { instituteId, ...input }, select: Model.courseSelect })
    );
  } catch {
    return Model.fail('Failed to create course', 'INTERNAL_ERROR');
  }
}

async function svcUpdateCourse(
  courseId: string,
  instituteId: string,
  input: Model.UpdateCourseInput
): Promise<Model.ServiceResult<Model.CourseRow>> {
  try {
    const result = await prisma.course.updateMany({
      where: { id: courseId, instituteId },
      data: input,
    });
    if (result.count === 0) return Model.fail('Course not found', 'NOT_FOUND');
    const updated = await prisma.course.findFirst({
      where: { id: courseId, instituteId },
      select: Model.courseSelect,
    });
    return Model.ok(updated!);
  } catch {
    return Model.fail('Failed to update course', 'INTERNAL_ERROR');
  }
}

async function svcDeleteCourse(
  courseId: string,
  instituteId: string
): Promise<Model.ServiceResult<null>> {
  try {
    const result = await prisma.course.deleteMany({ where: { id: courseId, instituteId } });
    return result.count === 0 ? Model.fail('Course not found', 'NOT_FOUND') : Model.ok(null);
  } catch {
    return Model.fail('Failed to delete course', 'INTERNAL_ERROR');
  }
}

async function svcGetBatches(
  instituteId: string,
  params: Model.BatchQueryParams = {}
): Promise<Model.ServiceResult<Model.BatchRow[]>> {
  try {
    const { q, courseId, status, includeDeleted } = params;
    return Model.ok(
      await prisma.batch.findMany({
        where: {
          instituteId,
          isDeleted: includeDeleted === 'true' ? undefined : false,
          ...(courseId && { courseId }),
          ...(status && { status }),
          ...(q && { name: { contains: q, mode: 'insensitive' } }),
        },
        select: Model.batchSelect,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch batches', 'INTERNAL_ERROR');
  }
}

async function svcGetBatchById(
  batchId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.BatchRow>> {
  try {
    const data = await prisma.batch.findFirst({
      where: { id: batchId, instituteId },
      select: Model.batchSelect,
    });
    return data ? Model.ok(data) : Model.fail('Batch not found', 'NOT_FOUND');
  } catch {
    return Model.fail('Failed to fetch batch', 'INTERNAL_ERROR');
  }
}

async function svcCreateBatch(
  instituteId: string,
  input: Model.CreateBatchInput
): Promise<Model.ServiceResult<Model.BatchRow>> {
  if (!input.name?.trim()) return Model.fail('Batch name is required', 'VALIDATION_ERROR');
  try {
    const course = await prisma.course.findFirst({ where: { id: input.courseId, instituteId } });
    if (!course) return Model.fail('Course not found', 'NOT_FOUND');
    const batch = await prisma.$transaction(async (tx) => {
      const created = await tx.batch.create({
        data: { instituteId, ...input },
        select: Model.batchSelect,
      });
      await tx.chatRoom.create({
        data: {
          instituteId,
          batchId: created.id,
          type: 'DISCUSSION',
          name: `${created.name} - Discussion`,
          messagingMode: MessagePermission.EVERYONE,
        },
      });
      return created;
    });
    return Model.ok(batch);
  } catch {
    return Model.fail('Failed to create batch', 'INTERNAL_ERROR');
  }
}

async function svcUpdateBatch(
  batchId: string,
  instituteId: string,
  input: Model.UpdateBatchInput
): Promise<Model.ServiceResult<Model.BatchRow>> {
  try {
    const result = await prisma.batch.updateMany({
      where: { id: batchId, instituteId },
      data: input,
    });
    if (result.count === 0) return Model.fail('Batch not found', 'NOT_FOUND');
    const updated = await prisma.batch.findFirst({
      where: { id: batchId, instituteId },
      select: Model.batchSelect,
    });
    return Model.ok(updated!);
  } catch {
    return Model.fail('Failed to update batch', 'INTERNAL_ERROR');
  }
}

async function svcDeleteBatch(
  batchId: string,
  instituteId: string
): Promise<Model.ServiceResult<null>> {
  try {
    const result = await prisma.batch.deleteMany({ where: { id: batchId, instituteId } });
    return result.count === 0 ? Model.fail('Batch not found', 'NOT_FOUND') : Model.ok(null);
  } catch {
    return Model.fail('Failed to delete batch', 'INTERNAL_ERROR');
  }
}

async function svcGetSubjects(
  instituteId: string
): Promise<Model.ServiceResult<Model.SubjectRow[]>> {
  try {
    return Model.ok(
      await prisma.subject.findMany({
        where: { instituteId },
        select: Model.subjectSelect,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch subjects', 'INTERNAL_ERROR');
  }
}

async function svcGetSubjectById(
  subjectId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.SubjectRow>> {
  try {
    const data = await prisma.subject.findFirst({
      where: { id: subjectId, instituteId },
      select: Model.subjectSelect,
    });
    return data ? Model.ok(data) : Model.fail('Subject not found', 'NOT_FOUND');
  } catch {
    return Model.fail('Failed to fetch subject', 'INTERNAL_ERROR');
  }
}

async function svcCreateSubject(
  instituteId: string,
  input: Model.CreateSubjectInput
): Promise<Model.ServiceResult<Model.SubjectRow>> {
  if (!input.name?.trim()) return Model.fail('Subject name is required', 'VALIDATION_ERROR');
  try {
    const course = await prisma.course.findFirst({ where: { id: input.courseId, instituteId } });
    if (!course) return Model.fail('Course not found', 'NOT_FOUND');
    return Model.ok(
      await prisma.subject.create({ data: { instituteId, ...input }, select: Model.subjectSelect })
    );
  } catch {
    return Model.fail('Failed to create subject', 'INTERNAL_ERROR');
  }
}

async function svcUpdateSubject(
  subjectId: string,
  instituteId: string,
  input: Model.UpdateSubjectInput
): Promise<Model.ServiceResult<Model.SubjectRow>> {
  if (input.name !== undefined && !input.name.trim())
    return Model.fail('Subject name cannot be empty', 'VALIDATION_ERROR');
  try {
    const result = await prisma.subject.updateMany({
      where: { id: subjectId, instituteId },
      data: input,
    });
    if (result.count === 0) return Model.fail('Subject not found', 'NOT_FOUND');
    const updated = await prisma.subject.findFirst({
      where: { id: subjectId, instituteId },
      select: Model.subjectSelect,
    });
    return Model.ok(updated!);
  } catch {
    return Model.fail('Failed to update subject', 'INTERNAL_ERROR');
  }
}

async function svcDeleteSubject(
  subjectId: string,
  instituteId: string
): Promise<Model.ServiceResult<null>> {
  try {
    const result = await prisma.subject.deleteMany({ where: { id: subjectId, instituteId } });
    return result.count === 0 ? Model.fail('Subject not found', 'NOT_FOUND') : Model.ok(null);
  } catch {
    return Model.fail('Failed to delete subject', 'INTERNAL_ERROR');
  }
}

async function svcGetEnrollments(
  instituteId: string,
  filters?: Model.EnrollmentFilters
): Promise<Model.ServiceResult<Model.EnrollmentRow[]>> {
  try {
    return Model.ok(
      await prisma.enrollment.findMany({
        where: {
          instituteId,
          ...(filters?.batchId && { batchId: filters.batchId }),
          ...(filters?.studentId && { studentId: filters.studentId }),
        },
        select: Model.enrollmentSelect,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch enrollments', 'INTERNAL_ERROR');
  }
}

async function svcCreateEnrollment(
  instituteId: string,
  input: { studentId: string; batchId: string; status?: string }
): Promise<Model.ServiceResult<Model.EnrollmentRow>> {
  try {
    const student = await prisma.user.findFirst({
      where: { id: input.studentId, instituteId, role: UserRole.STUDENT, isDeleted: false },
    });
    if (!student) return Model.fail('Student not found', 'NOT_FOUND');
    const batch = await prisma.batch.findFirst({ where: { id: input.batchId, instituteId } });
    if (!batch) return Model.fail('Batch not found', 'NOT_FOUND');
    const existing = await prisma.enrollment.findFirst({
      where: { studentId: input.studentId, batchId: input.batchId },
    });
    if (existing) return Model.fail('Student already enrolled in this batch', 'ALREADY_EXISTS');
    return Model.ok(
      await prisma.enrollment.create({
        data: {
          instituteId,
          studentId: input.studentId,
          batchId: input.batchId,
          status: input.status,
        },
        select: Model.enrollmentSelect,
      })
    );
  } catch {
    return Model.fail('Failed to create enrollment', 'INTERNAL_ERROR');
  }
}

async function svcDeleteEnrollment(
  enrollmentId: string,
  instituteId: string
): Promise<Model.ServiceResult<null>> {
  try {
    const enrollment = await prisma.enrollment.findFirst({
      where: { id: enrollmentId, instituteId },
    });
    if (!enrollment) return Model.fail('Enrollment not found', 'NOT_FOUND');
    await prisma.enrollment.delete({ where: { id: enrollmentId } });
    return Model.ok(null);
  } catch {
    return Model.fail('Failed to delete enrollment', 'INTERNAL_ERROR');
  }
}

async function svcGetParentStudents(
  instituteId: string
): Promise<Model.ServiceResult<Model.ParentStudentRow[]>> {
  try {
    return Model.ok(
      await prisma.parentStudent.findMany({
        where: {
          parent: { instituteId },
        },
        select: Model.parentStudentSelect,
      })
    );
  } catch {
    return Model.fail('Failed to fetch parent-student links', 'INTERNAL_ERROR');
  }
}

async function svcLinkParentStudent(
  instituteId: string,
  input: { parentId: string; studentId: string }
): Promise<Model.ServiceResult<Model.ParentStudentRow>> {
  try {
    const parent = await prisma.user.findFirst({
      where: { id: input.parentId, instituteId, role: UserRole.PARENT, isDeleted: false },
    });
    if (!parent) return Model.fail('Parent not found', 'NOT_FOUND');
    const student = await prisma.user.findFirst({
      where: { id: input.studentId, instituteId, role: UserRole.STUDENT, isDeleted: false },
    });
    if (!student) return Model.fail('Student not found', 'NOT_FOUND');
    const existing = await prisma.parentStudent.findFirst({
      where: { parentId: input.parentId, studentId: input.studentId },
    });
    if (existing) return Model.fail('Parent-student link already exists', 'ALREADY_EXISTS');
    return Model.ok(
      await prisma.parentStudent.create({
        data: { parentId: input.parentId, studentId: input.studentId },
        select: Model.parentStudentSelect,
      })
    );
  } catch {
    return Model.fail('Failed to link parent and student', 'INTERNAL_ERROR');
  }
}

async function svcUnlinkParentStudent(
  linkId: string,
  instituteId: string
): Promise<Model.ServiceResult<null>> {
  try {
    const link = await prisma.parentStudent.findFirst({
      where: { id: linkId, parent: { instituteId } },
    });
    if (!link) return Model.fail('Parent-student link not found', 'NOT_FOUND');
    await prisma.parentStudent.delete({ where: { id: linkId } });
    return Model.ok(null);
  } catch {
    return Model.fail('Failed to unlink parent and student', 'INTERNAL_ERROR');
  }
}

async function svcGetAttendance(
  instituteId: string,
  filters?: Model.AttendanceFilters
): Promise<Model.ServiceResult<Model.AttendanceRow[]>> {
  try {
    return Model.ok(
      await prisma.attendance.findMany({
        where: {
          instituteId,
          ...(filters?.batchId && { batchId: filters.batchId }),
          ...(filters?.studentId && { studentId: filters.studentId }),
          ...(filters?.date && { date: filters.date }),
        },
        select: Model.attendanceSelect,
        orderBy: { date: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch attendance', 'INTERNAL_ERROR');
  }
}

async function svcGetAttendanceById(
  attendanceId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.AttendanceRow>> {
  try {
    const data = await prisma.attendance.findFirst({
      where: { id: attendanceId, instituteId },
      select: Model.attendanceSelect,
    });
    return data ? Model.ok(data) : Model.fail('Attendance record not found', 'NOT_FOUND');
  } catch {
    return Model.fail('Failed to fetch attendance record', 'INTERNAL_ERROR');
  }
}

async function svcCreateAttendance(
  instituteId: string,
  input: Model.CreateAttendanceInput
): Promise<Model.ServiceResult<Model.AttendanceRow>> {
  try {
    const [student, batch] = await Promise.all([
      prisma.user.findFirst({
        where: { id: input.studentId, instituteId, role: UserRole.STUDENT },
      }),
      prisma.batch.findFirst({ where: { id: input.batchId, instituteId } }),
    ]);
    if (!student) return Model.fail('Student not found', 'NOT_FOUND');
    if (!batch) return Model.fail('Batch not found', 'NOT_FOUND');
    if (input.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: input.subjectId, instituteId },
      });
      if (!subject) return Model.fail('Subject not found', 'NOT_FOUND');
    }
    return Model.ok(
      await prisma.attendance.create({
        data: { instituteId, ...input },
        select: Model.attendanceSelect,
      })
    );
  } catch {
    return Model.fail('Failed to create attendance record', 'INTERNAL_ERROR');
  }
}

async function svcUpdateAttendance(
  attendanceId: string,
  instituteId: string,
  input: Model.UpdateAttendanceInput
): Promise<Model.ServiceResult<Model.AttendanceRow>> {
  try {
    const result = await prisma.attendance.updateMany({
      where: { id: attendanceId, instituteId },
      data: input,
    });
    if (result.count === 0) return Model.fail('Attendance record not found', 'NOT_FOUND');
    const updated = await prisma.attendance.findFirst({
      where: { id: attendanceId, instituteId },
      select: Model.attendanceSelect,
    });
    return Model.ok(updated!);
  } catch {
    return Model.fail('Failed to update attendance record', 'INTERNAL_ERROR');
  }
}

async function svcDeleteAttendance(
  attendanceId: string,
  instituteId: string
): Promise<Model.ServiceResult<null>> {
  try {
    const result = await prisma.attendance.deleteMany({ where: { id: attendanceId, instituteId } });
    return result.count === 0
      ? Model.fail('Attendance record not found', 'NOT_FOUND')
      : Model.ok(null);
  } catch {
    return Model.fail('Failed to delete attendance record', 'INTERNAL_ERROR');
  }
}

async function svcGetChatRooms(
  instituteId: string
): Promise<Model.ServiceResult<Model.ChatRoomRow[]>> {
  try {
    return Model.ok(
      await prisma.chatRoom.findMany({
        where: { instituteId },
        select: Model.chatRoomSelect,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch chat rooms', 'INTERNAL_ERROR');
  }
}

async function svcGetChatMessages(
  instituteId: string,
  chatRoomId: string,
  limit = 50,
  before?: string
): Promise<Model.ServiceResult<Model.ChatMessageRow[]>> {
  try {
    const room = await prisma.chatRoom.findFirst({ where: { id: chatRoomId, instituteId } });
    if (!room) return Model.fail('Chat room not found', 'NOT_FOUND');
    return Model.ok(
      await prisma.chatMessage.findMany({
        where: { chatRoomId, ...(before && { id: { lt: before } }) },
        select: Model.chatMessageSelect,
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
    );
  } catch {
    return Model.fail('Failed to fetch messages', 'INTERNAL_ERROR');
  }
}

async function svcCreateChatRoom(
  instituteId: string,
  input: Model.CreateChatRoomInput
): Promise<Model.ServiceResult<Model.ChatRoomRow>> {
  try {
    if (input.type === 'ANNOUNCEMENT') {
      // Institute-level announcement room — no batchId required
      const existing = await prisma.chatRoom.findFirst({
        where: { instituteId, type: 'ANNOUNCEMENT', batchId: null },
      });
      if (existing)
        return Model.fail('Institute announcement room already exists', 'ALREADY_EXISTS');
      return Model.ok(
        await prisma.chatRoom.create({
          data: {
            instituteId,
            type: 'ANNOUNCEMENT',
            name: input.name ?? 'Institute Announcements',
            messagingMode: MessagePermission.ADMIN_ONLY,
          },
          select: Model.chatRoomSelect,
        })
      );
    }
    if (!input.batchId)
      return Model.fail('batchId is required for non-announcement rooms', 'VALIDATION_ERROR');
    const batch = await prisma.batch.findFirst({ where: { id: input.batchId, instituteId } });
    if (!batch) return Model.fail('Batch not found', 'NOT_FOUND');
    const existing = await prisma.chatRoom.findUnique({
      where: { batchId_type: { batchId: input.batchId, type: input.type } },
    });
    if (existing)
      return Model.fail('Chat room already exists for this batch and type', 'ALREADY_EXISTS');
    return Model.ok(
      await prisma.chatRoom.create({
        data: { instituteId, ...input },
        select: Model.chatRoomSelect,
      })
    );
  } catch {
    return Model.fail('Failed to create chat room', 'INTERNAL_ERROR');
  }
}

async function svcGetResources(
  instituteId: string,
  params?: Model.ResourceQueryParams
): Promise<Model.ServiceResult<Model.ResourceRow[]>> {
  try {
    return Model.ok(
      await prisma.resource.findMany({
        where: {
          instituteId,
          ...(params?.batchId && { batchId: params.batchId }),
          ...(params?.subjectId && { subjectId: params.subjectId }),
        },
        select: Model.resourceSelect,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch resources', 'INTERNAL_ERROR');
  }
}

async function svcCreateResource(
  instituteId: string,
  uploadedBy: string,
  input: Model.CreateResourceInput
): Promise<Model.ServiceResult<Model.ResourceRow>> {
  if (!input.title?.trim()) return Model.fail('Resource title is required', 'VALIDATION_ERROR');
  if (!input.fileUrl?.trim()) return Model.fail('File URL is required', 'VALIDATION_ERROR');
  try {
    const batch = await prisma.batch.findFirst({ where: { id: input.batchId, instituteId } });
    if (!batch) return Model.fail('Batch not found', 'NOT_FOUND');
    if (input.subjectId) {
      const subject = await prisma.subject.findFirst({
        where: { id: input.subjectId, instituteId },
      });
      if (!subject) return Model.fail('Subject not found', 'NOT_FOUND');
    }
    return Model.ok(
      await prisma.resource.create({
        data: { instituteId, uploadedBy, ...input },
        select: Model.resourceSelect,
      })
    );
  } catch {
    return Model.fail('Failed to create resource', 'INTERNAL_ERROR');
  }
}

async function svcUpdateChatRoom(
  chatRoomId: string,
  instituteId: string,
  input: Model.UpdateChatRoomInput
): Promise<Model.ServiceResult<Model.ChatRoomRow>> {
  try {
    const room = await prisma.chatRoom.findFirst({ where: { id: chatRoomId, instituteId } });
    if (!room) return Model.fail('Chat room not found', 'NOT_FOUND');
    return Model.ok(
      await prisma.chatRoom.update({
        where: { id: chatRoomId },
        data: input,
        select: Model.chatRoomSelect,
      })
    );
  } catch {
    return Model.fail('Failed to update chat room', 'INTERNAL_ERROR');
  }
}

async function svcSendAdminChatMessage(
  adminId: string,
  chatRoomId: string,
  instituteId: string,
  input: Model.SendAdminMessageInput
): Promise<Model.ServiceResult<Model.ChatMessageRow>> {
  if (!input.content?.trim()) return Model.fail('Message content is required', 'VALIDATION_ERROR');
  try {
    const room = await prisma.chatRoom.findFirst({ where: { id: chatRoomId, instituteId } });
    if (!room) return Model.fail('Chat room not found', 'NOT_FOUND');
    const message = await prisma.chatMessage.create({
      data: {
        chatRoomId,
        senderId: adminId,
        content: input.content,
        messageType: input.messageType ?? MessageType.TEXT,
        fileUrl: input.fileUrl,
        isAnnouncement: input.isAnnouncement ?? false,
      },
      select: Model.chatMessageSelect,
    });
    await publishChatMessageEvent({ roomId: chatRoomId, message });
    return Model.ok(message);
  } catch {
    return Model.fail('Failed to send message', 'INTERNAL_ERROR');
  }
}

async function svcEnsureInstituteAnnouncementRoom(
  instituteId: string
): Promise<Model.ServiceResult<Model.ChatRoomRow>> {
  try {
    const existing = await prisma.chatRoom.findFirst({
      where: { instituteId, type: 'ANNOUNCEMENT', batchId: null },
      select: Model.chatRoomSelect,
    });
    if (existing) return Model.ok(existing);
    return Model.ok(
      await prisma.chatRoom.create({
        data: {
          instituteId,
          type: 'ANNOUNCEMENT',
          name: 'Institute Announcements',
          messagingMode: MessagePermission.ADMIN_ONLY,
        },
        select: Model.chatRoomSelect,
      })
    );
  } catch {
    return Model.fail('Failed to ensure institute announcement room', 'INTERNAL_ERROR');
  }
}

async function svcSendInstituteAnnouncement(
  adminId: string,
  instituteId: string,
  content: string
): Promise<Model.ServiceResult<Model.ChatMessageRow>> {
  if (!content?.trim()) return Model.fail('Announcement content is required', 'VALIDATION_ERROR');
  try {
    const roomResult = await svcEnsureInstituteAnnouncementRoom(instituteId);
    if (!roomResult.success) return roomResult;
    const room = roomResult.data;
    const enrollments = await prisma.enrollment.findMany({
      where: { batch: { instituteId } },
      select: { studentId: true },
    });
    const uniqueStudentIds = [...new Set(enrollments.map((e) => e.studentId))];
    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.chatMessage.create({
        data: {
          chatRoomId: room.id,
          senderId: adminId,
          content,
          messageType: MessageType.TEXT,
          isAnnouncement: true,
        },
        select: Model.chatMessageSelect,
      });
      if (uniqueStudentIds.length > 0) {
        await tx.notification.createMany({
          data: uniqueStudentIds.map((studentId) => ({
            userId: studentId,
            type: NotificationType.ANNOUNCEMENT,
            title: 'New Announcement',
            message: content.substring(0, 100),
            entityId: msg.id,
          })),
          skipDuplicates: true,
        });
      }
      return msg;
    });
    await publishChatMessageEvent({ roomId: room.id, message });
    return Model.ok(message);
  } catch {
    return Model.fail('Failed to send institute announcement', 'INTERNAL_ERROR');
  }
}

async function svcGetNotifications(
  userId: string
): Promise<Model.ServiceResult<Model.NotificationRow[]>> {
  try {
    return Model.ok(
      await prisma.notification.findMany({
        where: { userId },
        select: Model.notificationSelect,
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    );
  } catch {
    return Model.fail('Failed to fetch notifications', 'INTERNAL_ERROR');
  }
}

async function svcMarkNotificationRead(
  userId: string,
  notificationId: string
): Promise<Model.ServiceResult<Model.NotificationRow>> {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!notification) return Model.fail('Notification not found', 'NOT_FOUND');
    return Model.ok(
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
        select: Model.notificationSelect,
      })
    );
  } catch {
    return Model.fail('Failed to mark notification as read', 'INTERNAL_ERROR');
  }
}

async function svcMarkAllNotificationsRead(userId: string): Promise<Model.ServiceResult<number>> {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return Model.ok(result.count);
  } catch {
    return Model.fail('Failed to mark notifications as read', 'INTERNAL_ERROR');
  }
}

export async function getStudents(
  req: Request<unknown, unknown, unknown, Model.UserQueryParams>,
  res: Response
) {
  return send(res, await svcGetStudents(req.user!.instituteId, req.query));
}

export async function getTeachers(
  req: Request<unknown, unknown, unknown, Model.UserQueryParams>,
  res: Response
) {
  return send(res, await svcGetTeachers(req.user!.instituteId, req.query));
}

export async function createUser(
  req: Request<unknown, unknown, Model.CreateUserRequest>,
  res: Response
) {
  const { name, email, password, address, city, state, role, status } = req.body;
  if (!name || !email || !password || !address || !city || !state || !role) {
    return res
      .status(400)
      .json({ error: 'name, email, password, address, city, state and role are required' });
  }
  return send(
    res,
    await svcCreateUser(req.user!.instituteId, {
      name,
      email,
      password,
      address,
      city,
      state,
      role: UserRole[role],
      status,
    }),
    201
  );
}

export async function updateUser(
  req: Request<{ userId: string }, unknown, Model.UpdateUserRequest>,
  res: Response
) {
  const { name, email, address, city, state, role, status } = req.body;
  return send(
    res,
    await svcUpdateUser(req.params.userId, req.user!.instituteId, {
      name,
      email,
      address,
      city,
      state,
      role: role ? UserRole[role] : undefined,
      status,
    })
  );
}

export async function deleteUser(req: Request<{ userId: string }>, res: Response) {
  const result = await svcDeleteUser(req.params.userId, req.user!.instituteId);
  if (!result.success) return send(res, result);
  return res.json({ message: 'User deleted successfully' });
}

export async function getCourses(
  req: Request<unknown, unknown, unknown, Model.CourseQueryParams>,
  res: Response
) {
  return send(res, await svcGetCourses(req.user!.instituteId, req.query));
}

export async function createCourse(
  req: Request<unknown, unknown, Model.CreateCourseRequest>,
  res: Response
) {
  const { name, description, startDate, endDate, status } = req.body;
  if (!name || !startDate)
    return res.status(400).json({ error: 'name and startDate are required' });
  return send(
    res,
    await svcCreateCourse(req.user!.instituteId, {
      name,
      description,
      status,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
    }),
    201
  );
}

export async function updateCourse(
  req: Request<{ courseId: string }, unknown, Model.UpdateCourseRequest>,
  res: Response
) {
  const { name, description, startDate, endDate, status } = req.body;
  return send(
    res,
    await svcUpdateCourse(req.params.courseId, req.user!.instituteId, {
      name,
      description,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })
  );
}

export async function deleteCourse(req: Request<{ courseId: string }>, res: Response) {
  const result = await svcDeleteCourse(req.params.courseId, req.user!.instituteId);
  if (!result.success) return send(res, result);
  return res.json({ message: 'Course deleted successfully' });
}

export async function getBatches(
  req: Request<unknown, unknown, unknown, Model.BatchQueryParams>,
  res: Response
) {
  return send(res, await svcGetBatches(req.user!.instituteId, req.query));
}

export async function createBatch(
  req: Request<unknown, unknown, Model.CreateBatchRequest>,
  res: Response
) {
  const { courseId, name, description, startDate, endDate, status } = req.body;
  if (!courseId || !name || !startDate)
    return res.status(400).json({ error: 'courseId, name and startDate are required' });
  return send(
    res,
    await svcCreateBatch(req.user!.instituteId, {
      courseId,
      name,
      description,
      status,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
    }),
    201
  );
}

export async function updateBatch(
  req: Request<{ batchId: string }, unknown, Model.UpdateBatchRequest>,
  res: Response
) {
  const { name, description, startDate, endDate, status } = req.body;
  return send(
    res,
    await svcUpdateBatch(req.params.batchId, req.user!.instituteId, {
      name,
      description,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })
  );
}

export async function deleteBatch(req: Request<{ batchId: string }>, res: Response) {
  const result = await svcDeleteBatch(req.params.batchId, req.user!.instituteId);
  if (!result.success) return send(res, result);
  return res.json({ message: 'Batch deleted successfully' });
}

export async function getSubjects(req: Request, res: Response) {
  return send(res, await svcGetSubjects(req.user!.instituteId));
}

export async function createSubject(
  req: Request<unknown, unknown, Model.CreateSubjectRequest>,
  res: Response
) {
  const { courseId, name } = req.body;
  if (!courseId || !name) return res.status(400).json({ error: 'courseId and name are required' });
  return send(res, await svcCreateSubject(req.user!.instituteId, { courseId, name }), 201);
}

export async function updateSubject(
  req: Request<{ subjectId: string }, unknown, Model.UpdateSubjectRequest>,
  res: Response
) {
  return send(res, await svcUpdateSubject(req.params.subjectId, req.user!.instituteId, req.body));
}

export async function deleteSubject(req: Request<{ subjectId: string }>, res: Response) {
  const result = await svcDeleteSubject(req.params.subjectId, req.user!.instituteId);
  if (!result.success) return send(res, result);
  return res.json({ message: 'Subject deleted successfully' });
}

export async function getAttendance(
  req: Request<unknown, unknown, unknown, Model.AttendanceQueryParams>,
  res: Response
) {
  const { batchId, studentId, date } = req.query;
  return send(
    res,
    await svcGetAttendance(req.user!.instituteId, {
      batchId,
      studentId,
      date: date ? new Date(date) : undefined,
    })
  );
}

export async function createAttendance(
  req: Request<unknown, unknown, Model.CreateAttendanceRequest>,
  res: Response
) {
  const { studentId, batchId, subjectId, date, status } = req.body;
  if (!studentId || !batchId || !date || !status)
    return res.status(400).json({ error: 'studentId, batchId, date and status are required' });
  return send(
    res,
    await svcCreateAttendance(req.user!.instituteId, {
      studentId,
      batchId,
      subjectId,
      status,
      date: new Date(date),
    }),
    201
  );
}

export async function updateAttendance(
  req: Request<{ attendanceId: string }, unknown, Model.UpdateAttendanceRequest>,
  res: Response
) {
  const { status, date } = req.body;
  return send(
    res,
    await svcUpdateAttendance(req.params.attendanceId, req.user!.instituteId, {
      status,
      date: date ? new Date(date) : undefined,
    })
  );
}

export async function deleteAttendance(req: Request<{ attendanceId: string }>, res: Response) {
  const result = await svcDeleteAttendance(req.params.attendanceId, req.user!.instituteId);
  if (!result.success) return send(res, result);
  return res.json({ message: 'Attendance record deleted successfully' });
}

export async function getChatRooms(req: Request, res: Response) {
  return send(res, await svcGetChatRooms(req.user!.instituteId));
}

export async function getChatMessages(
  req: Request<{ chatRoomId: string }, unknown, unknown, Model.MessagesQueryParams>,
  res: Response
) {
  const { limit, before } = req.query;
  return send(
    res,
    await svcGetChatMessages(
      req.user!.instituteId,
      req.params.chatRoomId,
      limit ? parseInt(limit, 10) : 50,
      before
    )
  );
}

export async function createChatRoom(
  req: Request<unknown, unknown, Model.CreateChatRoomRequest>,
  res: Response
) {
  const { batchId, type, name } = req.body;
  if (!type) return res.status(400).json({ error: 'type is required' });
  if (type !== 'ANNOUNCEMENT' && !batchId)
    return res.status(400).json({ error: 'batchId is required for non-announcement rooms' });
  return send(res, await svcCreateChatRoom(req.user!.instituteId, { batchId, type, name }), 201);
}

export async function updateChatRoom(
  req: Request<{ chatRoomId: string }, unknown, Model.UpdateChatRoomInput>,
  res: Response
) {
  return send(res, await svcUpdateChatRoom(req.params.chatRoomId, req.user!.instituteId, req.body));
}

export async function sendAdminChatMessage(
  req: Request<{ chatRoomId: string }, unknown, Model.SendAdminMessageInput>,
  res: Response
) {
  return send(
    res,
    await svcSendAdminChatMessage(
      req.user!.id,
      req.params.chatRoomId,
      req.user!.instituteId,
      req.body
    ),
    201
  );
}

export async function getInstituteAnnouncementRoom(req: Request, res: Response) {
  return send(res, await svcEnsureInstituteAnnouncementRoom(req.user!.instituteId));
}

export async function sendInstituteAnnouncement(
  req: Request<unknown, unknown, Model.SendInstituteAnnouncementRequest>,
  res: Response
) {
  return send(
    res,
    await svcSendInstituteAnnouncement(req.user!.id, req.user!.instituteId, req.body.content),
    201
  );
}

export async function getNotifications(req: Request, res: Response) {
  return send(res, await svcGetNotifications(req.user!.id));
}

export async function markNotificationRead(
  req: Request<{ notificationId: string }>,
  res: Response
) {
  return send(res, await svcMarkNotificationRead(req.user!.id, req.params.notificationId));
}

export async function markAllNotificationsRead(req: Request, res: Response) {
  return send(res, await svcMarkAllNotificationsRead(req.user!.id));
}

export async function getResources(
  req: Request<unknown, unknown, unknown, Model.ResourceQueryParams>,
  res: Response
) {
  return send(res, await svcGetResources(req.user!.instituteId, req.query));
}

export async function createResource(
  req: Request<unknown, unknown, Model.CreateResourceRequest>,
  res: Response
) {
  const { batchId, subjectId, title, fileUrl, description, fileType } = req.body;
  if (!batchId || !title || !fileUrl)
    return res.status(400).json({ error: 'batchId, title and fileUrl are required' });
  return send(
    res,
    await svcCreateResource(req.user!.instituteId, req.user!.id, {
      batchId,
      subjectId,
      title,
      fileUrl,
      description,
      fileType,
    }),
    201
  );
}

export async function getEnrollments(
  req: Request<unknown, unknown, unknown, Model.EnrollmentFilters>,
  res: Response
) {
  return send(res, await svcGetEnrollments(req.user!.instituteId, req.query));
}

export async function createEnrollment(
  req: Request<unknown, unknown, Model.CreateEnrollmentRequest>,
  res: Response
) {
  const { studentId, batchId, status } = req.body;
  if (!studentId || !batchId)
    return res.status(400).json({ error: 'studentId and batchId are required' });
  return send(
    res,
    await svcCreateEnrollment(req.user!.instituteId, { studentId, batchId, status }),
    201
  );
}

export async function deleteEnrollment(req: Request<{ enrollmentId: string }>, res: Response) {
  const result = await svcDeleteEnrollment(req.params.enrollmentId, req.user!.instituteId);
  if (!result.success) return send(res, result);
  return res.json({ message: 'Enrollment deleted successfully' });
}

export async function getParentStudents(req: Request, res: Response) {
  return send(res, await svcGetParentStudents(req.user!.instituteId));
}

export async function linkParentStudent(
  req: Request<unknown, unknown, Model.LinkParentStudentRequest>,
  res: Response
) {
  const { parentId, studentId } = req.body;
  if (!parentId || !studentId)
    return res.status(400).json({ error: 'parentId and studentId are required' });
  return send(res, await svcLinkParentStudent(req.user!.instituteId, { parentId, studentId }), 201);
}

export async function unlinkParentStudent(req: Request<{ linkId: string }>, res: Response) {
  const result = await svcUnlinkParentStudent(req.params.linkId, req.user!.instituteId);
  if (!result.success) return send(res, result);
  return res.json({ message: 'Parent-student link removed successfully' });
}

// ============================================
// Teacher Assignments (TeacherSubject)
// ============================================

async function svcGetTeacherAssignments(
  instituteId: string,
  filters?: Model.TeacherAssignmentQueryParams
): Promise<Model.ServiceResult<Model.TeacherAssignmentRow[]>> {
  try {
    return Model.ok(
      await prisma.teacherSubject.findMany({
        where: {
          instituteId,
          ...(filters?.batchId && { batchId: filters.batchId }),
          ...(filters?.teacherId && { teacherId: filters.teacherId }),
          ...(filters?.subjectId && { subjectId: filters.subjectId }),
        },
        select: Model.teacherAssignmentSelect,
      })
    );
  } catch {
    return Model.fail('Failed to fetch teacher assignments', 'INTERNAL_ERROR');
  }
}

async function svcCreateTeacherAssignment(
  instituteId: string,
  input: Model.CreateTeacherAssignmentInput
): Promise<Model.ServiceResult<Model.TeacherAssignmentRow>> {
  try {
    // Verify teacher exists and is a teacher
    const teacher = await prisma.user.findFirst({
      where: { id: input.teacherId, instituteId, role: UserRole.TEACHER, isDeleted: false },
    });
    if (!teacher) return Model.fail('Teacher not found', 'NOT_FOUND');

    // Verify batch exists
    const batch = await prisma.batch.findFirst({
      where: { id: input.batchId, instituteId, isDeleted: false },
    });
    if (!batch) return Model.fail('Batch not found', 'NOT_FOUND');

    // Verify subject exists
    const subject = await prisma.subject.findFirst({
      where: { id: input.subjectId, instituteId },
    });
    if (!subject) return Model.fail('Subject not found', 'NOT_FOUND');

    // Check if assignment already exists
    const existing = await prisma.teacherSubject.findFirst({
      where: {
        teacherId: input.teacherId,
        subjectId: input.subjectId,
        batchId: input.batchId,
      },
    });
    if (existing)
      return Model.fail(
        'Teacher is already assigned to this subject in this batch',
        'ALREADY_EXISTS'
      );

    return Model.ok(
      await prisma.teacherSubject.create({
        data: { instituteId, ...input },
        select: Model.teacherAssignmentSelect,
      })
    );
  } catch {
    return Model.fail('Failed to create teacher assignment', 'INTERNAL_ERROR');
  }
}

async function svcDeleteTeacherAssignment(
  assignmentId: string,
  instituteId: string
): Promise<Model.ServiceResult<null>> {
  try {
    const result = await prisma.teacherSubject.deleteMany({
      where: { id: assignmentId, instituteId },
    });
    return result.count === 0
      ? Model.fail('Teacher assignment not found', 'NOT_FOUND')
      : Model.ok(null);
  } catch {
    return Model.fail('Failed to delete teacher assignment', 'INTERNAL_ERROR');
  }
}

export async function getTeacherAssignments(
  req: Request<unknown, unknown, unknown, Model.TeacherAssignmentQueryParams>,
  res: Response
) {
  return send(res, await svcGetTeacherAssignments(req.user!.instituteId, req.query));
}

export async function createTeacherAssignment(
  req: Request<unknown, unknown, Model.CreateTeacherAssignmentRequest>,
  res: Response
) {
  const { teacherId, subjectId, batchId } = req.body;
  if (!teacherId || !subjectId || !batchId) {
    return res.status(400).json({ error: 'teacherId, subjectId, and batchId are required' });
  }
  return send(
    res,
    await svcCreateTeacherAssignment(req.user!.instituteId, { teacherId, subjectId, batchId }),
    201
  );
}

export async function deleteTeacherAssignment(
  req: Request<{ assignmentId: string }>,
  res: Response
) {
  const result = await svcDeleteTeacherAssignment(req.params.assignmentId, req.user!.instituteId);
  if (!result.success) return send(res, result);
  return res.json({ message: 'Teacher assignment deleted successfully' });
}

export async function getDashboardStats(req: Request, res: Response) {
  return send(res, await svcGetDashboardStats(req.user!.instituteId));
}

// --- Soft Delete Restore Functions ---

async function svcGetDeletedUsers(
  instituteId: string
): Promise<Model.ServiceResult<Model.UserRow[]>> {
  try {
    return Model.ok(
      await prisma.user.findMany({
        where: { instituteId, isDeleted: true },
        select: Model.userSelect,
        orderBy: { updatedAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch deleted users', 'INTERNAL_ERROR');
  }
}

async function svcRestoreUser(
  userId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.UserRow>> {
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, instituteId, isDeleted: true },
    });
    if (!user) return Model.fail('User not found or not deleted', 'NOT_FOUND');
    return Model.ok(
      await prisma.user.update({
        where: { id: userId },
        data: { isDeleted: false },
        select: Model.userSelect,
      })
    );
  } catch {
    return Model.fail('Failed to restore user', 'INTERNAL_ERROR');
  }
}

async function svcGetDeletedCourses(
  instituteId: string
): Promise<Model.ServiceResult<Model.CourseRow[]>> {
  try {
    return Model.ok(
      await prisma.course.findMany({
        where: { instituteId, isDeleted: true },
        select: Model.courseSelect,
        orderBy: { updatedAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch deleted courses', 'INTERNAL_ERROR');
  }
}

async function svcRestoreCourse(
  courseId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.CourseRow>> {
  try {
    const course = await prisma.course.findFirst({
      where: { id: courseId, instituteId, isDeleted: true },
    });
    if (!course) return Model.fail('Course not found or not deleted', 'NOT_FOUND');
    return Model.ok(
      await prisma.course.update({
        where: { id: courseId },
        data: { isDeleted: false },
        select: Model.courseSelect,
      })
    );
  } catch {
    return Model.fail('Failed to restore course', 'INTERNAL_ERROR');
  }
}

async function svcGetDeletedBatches(
  instituteId: string
): Promise<Model.ServiceResult<Model.BatchRow[]>> {
  try {
    return Model.ok(
      await prisma.batch.findMany({
        where: { instituteId, isDeleted: true },
        select: Model.batchSelect,
        orderBy: { updatedAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch deleted batches', 'INTERNAL_ERROR');
  }
}

async function svcRestoreBatch(
  batchId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.BatchRow>> {
  try {
    const batch = await prisma.batch.findFirst({
      where: { id: batchId, instituteId, isDeleted: true },
    });
    if (!batch) return Model.fail('Batch not found or not deleted', 'NOT_FOUND');
    return Model.ok(
      await prisma.batch.update({
        where: { id: batchId },
        data: { isDeleted: false },
        select: Model.batchSelect,
      })
    );
  } catch {
    return Model.fail('Failed to restore batch', 'INTERNAL_ERROR');
  }
}

// --- Audit Log Functions ---

async function svcGetAuditLogs(
  instituteId: string,
  params: Model.AuditLogQueryParams = {}
): Promise<Model.ServiceResult<Model.AuditLogRow[]>> {
  try {
    const { entityType, entityId, userId, action, from, to } = params;
    return Model.ok(
      await prisma.auditLog.findMany({
        where: {
          user: { instituteId },
          ...(entityType && { entityType }),
          ...(entityId && { entityId }),
          ...(userId && { userId }),
          ...(action && { action }),
          ...((from || to) && {
            createdAt: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }),
        },
        select: Model.auditLogSelect,
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    );
  } catch {
    return Model.fail('Failed to fetch audit logs', 'INTERNAL_ERROR');
  }
}

// Exported Handlers

export async function getDeletedUsers(req: Request, res: Response) {
  return send(res, await svcGetDeletedUsers(req.user!.instituteId));
}

export async function restoreUser(req: Request<{ userId: string }>, res: Response) {
  return send(res, await svcRestoreUser(req.params.userId, req.user!.instituteId));
}

export async function getDeletedCourses(req: Request, res: Response) {
  return send(res, await svcGetDeletedCourses(req.user!.instituteId));
}

export async function restoreCourse(req: Request<{ courseId: string }>, res: Response) {
  return send(res, await svcRestoreCourse(req.params.courseId, req.user!.instituteId));
}

export async function getDeletedBatches(req: Request, res: Response) {
  return send(res, await svcGetDeletedBatches(req.user!.instituteId));
}

export async function restoreBatch(req: Request<{ batchId: string }>, res: Response) {
  return send(res, await svcRestoreBatch(req.params.batchId, req.user!.instituteId));
}

export async function getAuditLogs(
  req: Request<unknown, unknown, unknown, Model.AuditLogQueryParams>,
  res: Response
) {
  return send(res, await svcGetAuditLogs(req.user!.instituteId, req.query));
}
