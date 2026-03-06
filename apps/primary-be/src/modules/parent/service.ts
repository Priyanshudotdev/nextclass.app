import { Request, Response } from 'express';
import { prisma, UserRole } from 'db';
import * as Model from './model';

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

async function svcGetProfile(userId: string): Promise<Model.ServiceResult<Model.ProfileRow>> {
  try {
    const data = await prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
      select: Model.profileSelect,
    });
    return data ? Model.ok(data) : Model.fail('Profile not found', 'NOT_FOUND');
  } catch {
    return Model.fail('Failed to fetch profile', 'INTERNAL_ERROR');
  }
}

async function svcUpdateProfile(
  userId: string,
  input: Model.UpdateProfileInput
): Promise<Model.ServiceResult<Model.ProfileRow>> {
  if (input.name !== undefined && !input.name.trim())
    return Model.fail('Name cannot be empty', 'VALIDATION_ERROR');
  try {
    await prisma.user.update({ where: { id: userId }, data: input });
    const updated = await prisma.user.findFirst({
      where: { id: userId },
      select: Model.profileSelect,
    });
    return Model.ok(updated!);
  } catch {
    return Model.fail('Failed to update profile', 'INTERNAL_ERROR');
  }
}

async function svcGetChildren(
  parentId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.ChildRow[]>> {
  try {
    const relations = await prisma.parentStudent.findMany({
      where: { parentId },
      select: { student: { select: Model.childSelect } },
    });
    return Model.ok(relations.map((r) => r.student));
  } catch {
    return Model.fail('Failed to fetch children', 'INTERNAL_ERROR');
  }
}

async function verifyParentChildRelation(parentId: string, studentId: string): Promise<boolean> {
  const relation = await prisma.parentStudent.findFirst({
    where: { parentId, studentId },
  });
  return !!relation;
}

async function svcGetChildProfile(
  parentId: string,
  studentId: string
): Promise<Model.ServiceResult<Model.ChildRow>> {
  try {
    const hasAccess = await verifyParentChildRelation(parentId, studentId);
    if (!hasAccess) return Model.fail('Access denied to this student', 'FORBIDDEN');
    const child = await prisma.user.findFirst({
      where: { id: studentId, role: UserRole.STUDENT, isDeleted: false },
      select: Model.childSelect,
    });
    return child ? Model.ok(child) : Model.fail('Student not found', 'NOT_FOUND');
  } catch {
    return Model.fail('Failed to fetch child profile', 'INTERNAL_ERROR');
  }
}

async function svcGetChildEnrollments(
  parentId: string,
  studentId: string
): Promise<Model.ServiceResult<Model.EnrollmentRow[]>> {
  try {
    const hasAccess = await verifyParentChildRelation(parentId, studentId);
    if (!hasAccess) return Model.fail('Access denied to this student', 'FORBIDDEN');
    return Model.ok(
      await prisma.enrollment.findMany({
        where: { studentId },
        select: Model.enrollmentSelect,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch child enrollments', 'INTERNAL_ERROR');
  }
}

async function svcGetChildAttendance(
  parentId: string,
  studentId: string,
  filters?: Model.AttendanceQueryParams
): Promise<Model.ServiceResult<Model.AttendanceRow[]>> {
  try {
    const hasAccess = await verifyParentChildRelation(parentId, studentId);
    if (!hasAccess) return Model.fail('Access denied to this student', 'FORBIDDEN');
    return Model.ok(
      await prisma.attendance.findMany({
        where: {
          studentId,
          ...(filters?.batchId && { batchId: filters.batchId }),
          ...(filters?.subjectId && { subjectId: filters.subjectId }),
          ...(filters?.startDate &&
            filters?.endDate && {
              date: { gte: new Date(filters.startDate), lte: new Date(filters.endDate) },
            }),
        },
        select: Model.attendanceSelect,
        orderBy: { date: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch attendance', 'INTERNAL_ERROR');
  }
}

async function svcGetChildSubjects(
  parentId: string,
  studentId: string,
  batchId: string
): Promise<Model.ServiceResult<Model.SubjectRow[]>> {
  try {
    const hasAccess = await verifyParentChildRelation(parentId, studentId);
    if (!hasAccess) return Model.fail('Access denied to this student', 'FORBIDDEN');
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId, batchId },
    });
    if (!enrollment) return Model.fail('Student not enrolled in this batch', 'NOT_FOUND');
    const batchSubjects = await prisma.batchSubject.findMany({
      where: { batchId },
      select: { subject: { select: Model.subjectSelect } },
    });
    return Model.ok(batchSubjects.map((bs) => bs.subject));
  } catch {
    return Model.fail('Failed to fetch subjects', 'INTERNAL_ERROR');
  }
}

async function svcGetChildResources(
  parentId: string,
  studentId: string,
  batchId: string
): Promise<Model.ServiceResult<Model.ResourceRow[]>> {
  try {
    const hasAccess = await verifyParentChildRelation(parentId, studentId);
    if (!hasAccess) return Model.fail('Access denied to this student', 'FORBIDDEN');
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId, batchId },
    });
    if (!enrollment) return Model.fail('Student not enrolled in this batch', 'NOT_FOUND');
    return Model.ok(
      await prisma.resource.findMany({
        where: { batchId },
        select: Model.resourceSelect,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch resources', 'INTERNAL_ERROR');
  }
}

async function svcGetChildTeachers(
  parentId: string,
  studentId: string,
  batchId: string
): Promise<Model.ServiceResult<Model.TeacherRow[]>> {
  try {
    const hasAccess = await verifyParentChildRelation(parentId, studentId);
    if (!hasAccess) return Model.fail('Access denied to this student', 'FORBIDDEN');
    const assignments = await prisma.teacherSubject.findMany({
      where: { batchId },
      select: { teacher: { select: Model.teacherSelect } },
    });
    const uniqueTeachers = Array.from(
      new Map(assignments.map((a) => [a.teacher.id, a.teacher])).values()
    );
    return Model.ok(uniqueTeachers);
  } catch {
    return Model.fail('Failed to fetch teachers', 'INTERNAL_ERROR');
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

export async function getProfile(req: Request, res: Response) {
  return send(res, await svcGetProfile(req.user!.id));
}

export async function updateProfile(
  req: Request<unknown, unknown, Model.UpdateProfileRequest>,
  res: Response
) {
  const { name, address, city, state } = req.body;
  return send(res, await svcUpdateProfile(req.user!.id, { name, address, city, state }));
}

export async function getChildren(req: Request, res: Response) {
  return send(res, await svcGetChildren(req.user!.id, req.user!.instituteId));
}

export async function getChildProfile(req: Request<{ studentId: string }>, res: Response) {
  return send(res, await svcGetChildProfile(req.user!.id, req.params.studentId));
}

export async function getChildEnrollments(req: Request<{ studentId: string }>, res: Response) {
  return send(res, await svcGetChildEnrollments(req.user!.id, req.params.studentId));
}

export async function getChildAttendance(
  req: Request<{ studentId: string }, unknown, unknown, Model.AttendanceQueryParams>,
  res: Response
) {
  return send(res, await svcGetChildAttendance(req.user!.id, req.params.studentId, req.query));
}

export async function getChildSubjects(
  req: Request<{ studentId: string; batchId: string }>,
  res: Response
) {
  return send(
    res,
    await svcGetChildSubjects(req.user!.id, req.params.studentId, req.params.batchId)
  );
}

export async function getChildResources(
  req: Request<{ studentId: string; batchId: string }>,
  res: Response
) {
  return send(
    res,
    await svcGetChildResources(req.user!.id, req.params.studentId, req.params.batchId)
  );
}

export async function getChildTeachers(
  req: Request<{ studentId: string; batchId: string }>,
  res: Response
) {
  return send(
    res,
    await svcGetChildTeachers(req.user!.id, req.params.studentId, req.params.batchId)
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

// --- Child Summary ---

async function svcGetChildSummary(
  parentId: string,
  studentId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.ChildSummary>> {
  try {
    // Verify parent-child relationship
    const link = await prisma.parentStudent.findFirst({
      where: { parentId, studentId },
    });
    if (!link) return Model.fail('Child not found', 'NOT_FOUND');

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const [child, enrollments, attendance, recentResources, unreadNotifications] =
      await Promise.all([
        prisma.user.findFirst({
          where: { id: studentId },
          select: { id: true, name: true, email: true },
        }),
        prisma.enrollment.findMany({
          where: { studentId, instituteId },
          select: {
            status: true,
            batch: {
              select: {
                id: true,
                name: true,
                course: { select: { name: true } },
              },
            },
          },
        }),
        prisma.attendance.findMany({
          where: { studentId, instituteId },
          select: { status: true },
        }),
        prisma.resource.count({
          where: {
            instituteId,
            batch: { enrollments: { some: { studentId } } },
            createdAt: { gte: last7Days },
          },
        }),
        prisma.notification.count({
          where: {
            userId: parentId,
            isRead: false,
          },
        }),
      ]);

    const activeEnrollments = enrollments.filter((e) => e.status === 'ACTIVE');
    const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
    const absentCount = attendance.filter((a) => a.status === 'ABSENT').length;
    const lateCount = attendance.filter((a) => a.status === 'LATE').length;
    const totalAttendance = attendance.length;

    return Model.ok({
      child: {
        id: child?.id || '',
        name: child?.name || '',
        email: child?.email || '',
      },
      enrollments: {
        total: enrollments.length,
        active: activeEnrollments.length,
        batches: activeEnrollments.map((e) => ({
          id: e.batch.id,
          name: e.batch.name,
          courseName: e.batch.course.name,
        })),
      },
      attendance: {
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        percentage: totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0,
      },
      recentResources,
      unreadNotifications,
    });
  } catch {
    return Model.fail('Failed to fetch child summary', 'INTERNAL_ERROR');
  }
}

export async function getChildSummary(req: Request<{ studentId: string }>, res: Response) {
  return send(
    res,
    await svcGetChildSummary(req.user!.id, req.params.studentId, req.user!.instituteId)
  );
}
