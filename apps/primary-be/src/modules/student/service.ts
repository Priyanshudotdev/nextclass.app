import { Request, Response } from 'express';
import { prisma, MessageType } from 'db';
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
    await prisma.user.update({
      where: { id: userId },
      data: input,
    });
    const updated = await prisma.user.findFirst({
      where: { id: userId },
      select: Model.profileSelect,
    });
    return Model.ok(updated!);
  } catch {
    return Model.fail('Failed to update profile', 'INTERNAL_ERROR');
  }
}

async function svcGetEnrollments(
  studentId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.EnrollmentRow[]>> {
  try {
    return Model.ok(
      await prisma.enrollment.findMany({
        where: { studentId, instituteId },
        select: Model.enrollmentSelect,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch enrollments', 'INTERNAL_ERROR');
  }
}

async function svcGetAttendance(
  studentId: string,
  instituteId: string,
  filters?: Model.AttendanceFilters
): Promise<Model.ServiceResult<Model.AttendanceRow[]>> {
  try {
    return Model.ok(
      await prisma.attendance.findMany({
        where: {
          studentId,
          instituteId,
          ...(filters?.batchId && { batchId: filters.batchId }),
          ...(filters?.subjectId && { subjectId: filters.subjectId }),
          ...(filters?.startDate &&
            filters?.endDate && {
              date: { gte: filters.startDate, lte: filters.endDate },
            }),
          ...(filters?.startDate && !filters?.endDate && { date: { gte: filters.startDate } }),
          ...(!filters?.startDate && filters?.endDate && { date: { lte: filters.endDate } }),
        },
        select: Model.attendanceSelect,
        orderBy: { date: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch attendance', 'INTERNAL_ERROR');
  }
}

async function svcGetSubjects(
  studentId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.SubjectRow[]>> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId, instituteId },
      select: { batch: { select: { courseId: true } } },
    });
    const courseIds = [...new Set(enrollments.map((e) => e.batch.courseId))];
    return Model.ok(
      await prisma.subject.findMany({
        where: { instituteId, courseId: { in: courseIds } },
        select: Model.subjectSelect,
        orderBy: { name: 'asc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch subjects', 'INTERNAL_ERROR');
  }
}

async function svcGetResources(
  studentId: string,
  instituteId: string,
  subjectId?: string
): Promise<Model.ServiceResult<Model.ResourceRow[]>> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId, instituteId },
      select: { batchId: true },
    });
    const batchIds = enrollments.map((e) => e.batchId);
    return Model.ok(
      await prisma.resource.findMany({
        where: {
          instituteId,
          batchId: { in: batchIds },
          ...(subjectId && { subjectId }),
        },
        select: Model.resourceSelect,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch resources', 'INTERNAL_ERROR');
  }
}

async function svcGetChatRooms(
  studentId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.ChatRoomRow[]>> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId, instituteId },
      select: { batchId: true },
    });
    const batchIds = enrollments.map((e) => e.batchId);
    return Model.ok(
      await prisma.chatRoom.findMany({
        where: { instituteId, batchId: { in: batchIds } },
        select: Model.chatRoomSelect,
        orderBy: { createdAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch chat rooms', 'INTERNAL_ERROR');
  }
}

async function svcGetChatMessages(
  studentId: string,
  instituteId: string,
  chatRoomId: string,
  limit = 50,
  before?: string
): Promise<Model.ServiceResult<Model.ChatMessageRow[]>> {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId, instituteId },
      select: { batchId: true },
    });
    const batchIds = enrollments.map((e) => e.batchId);
    const chatRoom = await prisma.chatRoom.findFirst({
      where: { id: chatRoomId, batchId: { in: batchIds } },
    });
    if (!chatRoom) return Model.fail('Chat room not found or access denied', 'FORBIDDEN');
    return Model.ok(
      await prisma.chatMessage.findMany({
        where: {
          chatRoomId,
          ...(before && { id: { lt: before } }),
        },
        select: Model.chatMessageSelect,
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
    );
  } catch {
    return Model.fail('Failed to fetch messages', 'INTERNAL_ERROR');
  }
}

async function svcSendMessage(
  studentId: string,
  instituteId: string,
  chatRoomId: string,
  input: Model.SendMessageInput
): Promise<Model.ServiceResult<Model.ChatMessageRow>> {
  if (!input.content?.trim()) return Model.fail('Message content is required', 'VALIDATION_ERROR');
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId, instituteId },
      select: { batchId: true },
    });
    const batchIds = enrollments.map((e) => e.batchId);
    const chatRoom = await prisma.chatRoom.findFirst({
      where: { id: chatRoomId, batchId: { in: batchIds } },
    });
    if (!chatRoom) return Model.fail('Chat room not found or access denied', 'FORBIDDEN');
    return Model.ok(
      await prisma.chatMessage.create({
        data: {
          chatRoomId,
          senderId: studentId,
          content: input.content,
          messageType: input.messageType || MessageType.TEXT,
          fileUrl: input.fileUrl,
        },
        select: Model.chatMessageSelect,
      })
    );
  } catch {
    return Model.fail('Failed to send message', 'INTERNAL_ERROR');
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

export async function getEnrollments(req: Request, res: Response) {
  return send(res, await svcGetEnrollments(req.user!.id, req.user!.instituteId));
}

export async function getAttendance(
  req: Request<unknown, unknown, unknown, Model.AttendanceQueryParams>,
  res: Response
) {
  const { batchId, subjectId, startDate, endDate } = req.query;
  return send(
    res,
    await svcGetAttendance(req.user!.id, req.user!.instituteId, {
      batchId,
      subjectId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    })
  );
}

export async function getSubjects(req: Request, res: Response) {
  return send(res, await svcGetSubjects(req.user!.id, req.user!.instituteId));
}

export async function getResources(req: Request<{ subjectId?: string }>, res: Response) {
  return send(
    res,
    await svcGetResources(req.user!.id, req.user!.instituteId, req.params.subjectId)
  );
}

export async function getChatRooms(req: Request, res: Response) {
  return send(res, await svcGetChatRooms(req.user!.id, req.user!.instituteId));
}

export async function getChatMessages(
  req: Request<{ chatRoomId: string }, unknown, unknown, Model.MessagesQueryParams>,
  res: Response
) {
  const { limit, before } = req.query;
  return send(
    res,
    await svcGetChatMessages(
      req.user!.id,
      req.user!.instituteId,
      req.params.chatRoomId,
      limit ? parseInt(limit) : 50,
      before
    )
  );
}

export async function sendMessage(
  req: Request<{ chatRoomId: string }, unknown, Model.SendMessageRequest>,
  res: Response
) {
  const { content, messageType, fileUrl } = req.body;
  if (!content) return res.status(400).json({ error: 'content is required' });
  return send(
    res,
    await svcSendMessage(req.user!.id, req.user!.instituteId, req.params.chatRoomId, {
      content,
      messageType: messageType ? MessageType[messageType] : undefined,
      fileUrl,
    }),
    201
  );
}

// --- Dashboard ---

async function svcGetDashboard(
  studentId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.StudentDashboard>> {
  try {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const [profile, enrollments, attendance, unreadMessages, recentResources] = await Promise.all([
      prisma.user.findFirst({
        where: { id: studentId },
        select: { name: true, email: true },
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
      prisma.chatMessage.count({
        where: {
          chatRoom: {
            instituteId,
            batch: { enrollments: { some: { studentId } } },
          },
          senderId: { not: studentId },
          createdAt: { gte: last7Days },
        },
      }),
      prisma.resource.count({
        where: {
          instituteId,
          batch: { enrollments: { some: { studentId } } },
          createdAt: { gte: last7Days },
        },
      }),
    ]);

    const activeEnrollments = enrollments.filter((e) => e.status === 'ACTIVE');
    const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
    const absentCount = attendance.filter((a) => a.status === 'ABSENT').length;
    const lateCount = attendance.filter((a) => a.status === 'LATE').length;
    const totalAttendance = attendance.length;

    return Model.ok({
      profile: {
        name: profile?.name || '',
        email: profile?.email || '',
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
      upcomingClasses: activeEnrollments.length,
      unreadMessages,
      recentResources,
    });
  } catch {
    return Model.fail('Failed to fetch dashboard', 'INTERNAL_ERROR');
  }
}

export async function getDashboard(req: Request, res: Response) {
  return send(res, await svcGetDashboard(req.user!.id, req.user!.instituteId));
}
