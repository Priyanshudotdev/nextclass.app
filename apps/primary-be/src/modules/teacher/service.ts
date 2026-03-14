import { Request, Response } from 'express';
import { prisma, AttendanceStatus, MessageType, NotificationType } from 'db';
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

async function svcGetAssignedSubjects(
  teacherId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.AssignmentRow[]>> {
  try {
    return Model.ok(
      await prisma.teacherSubject.findMany({
        where: { teacherId, instituteId },
        select: Model.assignmentSelect,
      })
    );
  } catch {
    return Model.fail('Failed to fetch assigned subjects', 'INTERNAL_ERROR');
  }
}

async function svcGetAssignedBatches(
  teacherId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.BatchRow[]>> {
  try {
    const assignments = await prisma.teacherSubject.findMany({
      where: { teacherId, instituteId },
      select: { batchId: true },
    });
    const batchIds = [...new Set(assignments.map((a) => a.batchId))];
    return Model.ok(
      await prisma.batch.findMany({
        where: { id: { in: batchIds }, instituteId },
        select: Model.batchSelect,
        orderBy: { name: 'asc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch assigned batches', 'INTERNAL_ERROR');
  }
}

async function svcGetBatchStudents(
  teacherId: string,
  instituteId: string,
  batchId: string
): Promise<Model.ServiceResult<Model.StudentRow[]>> {
  try {
    const hasAccess = await prisma.teacherSubject.findFirst({
      where: { teacherId, instituteId, batchId },
    });
    if (!hasAccess) return Model.fail('Access denied to this batch', 'FORBIDDEN');
    const enrollments = await prisma.enrollment.findMany({
      where: { batchId, instituteId },
      select: { student: { select: Model.studentSelect } },
    });
    return Model.ok(enrollments.map((e) => e.student));
  } catch {
    return Model.fail('Failed to fetch batch students', 'INTERNAL_ERROR');
  }
}

async function svcMarkAttendance(
  teacherId: string,
  instituteId: string,
  input: Model.MarkAttendanceInput
): Promise<Model.ServiceResult<Model.AttendanceRow>> {
  try {
    const hasAccess = await prisma.teacherSubject.findFirst({
      where: { teacherId, instituteId, batchId: input.batchId },
    });
    if (!hasAccess) return Model.fail('Access denied to this batch', 'FORBIDDEN');
    const enrollment = await prisma.enrollment.findFirst({
      where: { studentId: input.studentId, batchId: input.batchId },
    });
    if (!enrollment) return Model.fail('Student not enrolled in this batch', 'NOT_FOUND');
    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_batchId_subjectId_date: {
          studentId: input.studentId,
          batchId: input.batchId,
          subjectId: input.subjectId || '',
          date: input.date,
        },
      },
      update: { status: input.status },
      create: {
        instituteId,
        studentId: input.studentId,
        batchId: input.batchId,
        subjectId: input.subjectId,
        date: input.date,
        status: input.status,
      },
      select: Model.attendanceSelect,
    });
    await prisma.notification.create({
      data: {
        userId: input.studentId,
        type: NotificationType.ATTENDANCE,
        title: 'Attendance Marked',
        message: `Your attendance has been marked as ${input.status}`,
        entityId: attendance.id,
      },
    });
    return Model.ok(attendance);
  } catch {
    return Model.fail('Failed to mark attendance', 'INTERNAL_ERROR');
  }
}

async function svcBulkMarkAttendance(
  teacherId: string,
  instituteId: string,
  input: Model.BulkAttendanceInput
): Promise<Model.ServiceResult<{ marked: number; failed: number }>> {
  try {
    const hasAccess = await prisma.teacherSubject.findFirst({
      where: { teacherId, instituteId, batchId: input.batchId },
    });
    if (!hasAccess) return Model.fail('Access denied to this batch', 'FORBIDDEN');
    let marked = 0;
    let failed = 0;
    for (const record of input.records) {
      try {
        await prisma.attendance.upsert({
          where: {
            studentId_batchId_subjectId_date: {
              studentId: record.studentId,
              batchId: input.batchId,
              subjectId: input.subjectId || '',
              date: input.date,
            },
          },
          update: { status: record.status },
          create: {
            instituteId,
            studentId: record.studentId,
            batchId: input.batchId,
            subjectId: input.subjectId,
            date: input.date,
            status: record.status,
          },
        });
        marked++;
      } catch {
        failed++;
      }
    }
    return Model.ok({ marked, failed });
  } catch {
    return Model.fail('Failed to mark bulk attendance', 'INTERNAL_ERROR');
  }
}

async function svcGetAttendance(
  teacherId: string,
  instituteId: string,
  filters?: Model.AttendanceQueryParams
): Promise<Model.ServiceResult<Model.AttendanceRow[]>> {
  try {
    const assignments = await prisma.teacherSubject.findMany({
      where: { teacherId, instituteId },
      select: { batchId: true },
    });
    const batchIds = [...new Set(assignments.map((a) => a.batchId))];
    return Model.ok(
      await prisma.attendance.findMany({
        where: {
          instituteId,
          batchId: filters?.batchId ? filters.batchId : { in: batchIds },
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

async function svcGetResources(
  teacherId: string,
  instituteId: string,
  filters?: Model.ResourceQueryParams
): Promise<Model.ServiceResult<Model.ResourceRow[]>> {
  try {
    return Model.ok(
      await prisma.resource.findMany({
        where: {
          uploadedBy: teacherId,
          instituteId,
          ...(filters?.batchId && { batchId: filters.batchId }),
          ...(filters?.subjectId && { subjectId: filters.subjectId }),
          ...(filters?.unitId && { unitId: filters.unitId }),
          ...(filters?.fileType && { fileType: filters.fileType }),
          ...(filters?.title && { title: { contains: filters.title, mode: 'insensitive' } }),
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
  teacherId: string,
  instituteId: string,
  input: Model.CreateResourceInput
): Promise<Model.ServiceResult<Model.ResourceRow>> {
  if (!input.title?.trim()) return Model.fail('Title is required', 'VALIDATION_ERROR');
  if (!input.fileUrl?.trim()) return Model.fail('File URL is required', 'VALIDATION_ERROR');
  try {
    const hasAccess = await prisma.teacherSubject.findFirst({
      where: { teacherId, instituteId, batchId: input.batchId },
    });
    if (!hasAccess) return Model.fail('Access denied to this batch', 'FORBIDDEN');
    const resource = await prisma.resource.create({
      data: {
        instituteId,
        uploadedBy: teacherId,
        batchId: input.batchId,
        subjectId: input.subjectId,
        unitId: input.unitId,
        title: input.title,
        fileUrl: input.fileUrl,
        description: input.description,
        fileType: input.fileType,
      },
      select: Model.resourceSelect,
    });
    const enrollments = await prisma.enrollment.findMany({
      where: { batchId: input.batchId },
      select: { studentId: true },
    });
    await prisma.notification.createMany({
      data: enrollments.map((e) => ({
        userId: e.studentId,
        type: NotificationType.RESOURCE,
        title: 'New Resource',
        message: `New resource "${input.title}" has been uploaded`,
        entityId: resource.id,
      })),
    });
    return Model.ok(resource);
  } catch {
    return Model.fail('Failed to create resource', 'INTERNAL_ERROR');
  }
}

async function svcUpdateResource(
  teacherId: string,
  instituteId: string,
  resourceId: string,
  input: Model.UpdateResourceInput
): Promise<Model.ServiceResult<Model.ResourceRow>> {
  try {
    const resource = await prisma.resource.findFirst({
      where: { id: resourceId, uploadedBy: teacherId, instituteId },
    });
    if (!resource) return Model.fail('Resource not found', 'NOT_FOUND');
    const updated = await prisma.resource.update({
      where: { id: resourceId },
      data: input,
      select: Model.resourceSelect,
    });
    return Model.ok(updated);
  } catch {
    return Model.fail('Failed to update resource', 'INTERNAL_ERROR');
  }
}

async function svcDeleteResource(
  teacherId: string,
  instituteId: string,
  resourceId: string
): Promise<Model.ServiceResult<null>> {
  try {
    const resource = await prisma.resource.findFirst({
      where: { id: resourceId, uploadedBy: teacherId, instituteId },
    });
    if (!resource) return Model.fail('Resource not found', 'NOT_FOUND');
    await prisma.resource.delete({ where: { id: resourceId } });
    return Model.ok(null);
  } catch {
    return Model.fail('Failed to delete resource', 'INTERNAL_ERROR');
  }
}

async function svcGetUnits(
  teacherId: string,
  instituteId: string,
  subjectId: string
): Promise<Model.ServiceResult<Model.UnitRow[]>> {
  try {
    const hasAccess = await prisma.teacherSubject.findFirst({
      where: { teacherId, instituteId, subjectId },
    });
    if (!hasAccess) return Model.fail('Access denied to this subject', 'FORBIDDEN');
    return Model.ok(
      await prisma.unit.findMany({
        where: { subjectId, instituteId },
        select: Model.unitSelect,
        orderBy: { orderIndex: 'asc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch units', 'INTERNAL_ERROR');
  }
}

async function svcCreateUnit(
  teacherId: string,
  instituteId: string,
  input: Model.CreateUnitInput
): Promise<Model.ServiceResult<Model.UnitRow>> {
  if (!input.name?.trim()) return Model.fail('Unit name is required', 'VALIDATION_ERROR');
  try {
    const hasAccess = await prisma.teacherSubject.findFirst({
      where: { teacherId, instituteId, subjectId: input.subjectId },
    });
    if (!hasAccess) return Model.fail('Access denied to this subject', 'FORBIDDEN');
    return Model.ok(
      await prisma.unit.create({
        data: {
          instituteId,
          subjectId: input.subjectId,
          name: input.name,
          description: input.description,
          orderIndex: input.orderIndex ?? 0,
        },
        select: Model.unitSelect,
      })
    );
  } catch {
    return Model.fail('Failed to create unit', 'INTERNAL_ERROR');
  }
}

async function svcUpdateUnit(
  teacherId: string,
  instituteId: string,
  unitId: string,
  input: Model.UpdateUnitInput
): Promise<Model.ServiceResult<Model.UnitRow>> {
  try {
    const unit = await prisma.unit.findFirst({ where: { id: unitId, instituteId } });
    if (!unit) return Model.fail('Unit not found', 'NOT_FOUND');
    const hasAccess = await prisma.teacherSubject.findFirst({
      where: { teacherId, instituteId, subjectId: unit.subjectId },
    });
    if (!hasAccess) return Model.fail('Access denied to this unit', 'FORBIDDEN');
    return Model.ok(
      await prisma.unit.update({ where: { id: unitId }, data: input, select: Model.unitSelect })
    );
  } catch {
    return Model.fail('Failed to update unit', 'INTERNAL_ERROR');
  }
}

async function svcDeleteUnit(
  teacherId: string,
  instituteId: string,
  unitId: string
): Promise<Model.ServiceResult<null>> {
  try {
    const unit = await prisma.unit.findFirst({ where: { id: unitId, instituteId } });
    if (!unit) return Model.fail('Unit not found', 'NOT_FOUND');
    const hasAccess = await prisma.teacherSubject.findFirst({
      where: { teacherId, instituteId, subjectId: unit.subjectId },
    });
    if (!hasAccess) return Model.fail('Access denied to this unit', 'FORBIDDEN');
    await prisma.unit.delete({ where: { id: unitId } });
    return Model.ok(null);
  } catch {
    return Model.fail('Failed to delete unit', 'INTERNAL_ERROR');
  }
}

async function svcGetChatRooms(
  teacherId: string,
  instituteId: string
): Promise<Model.ServiceResult<Model.ChatRoomRow[]>> {
  try {
    const assignments = await prisma.teacherSubject.findMany({
      where: { teacherId, instituteId },
      select: { batchId: true },
    });
    const batchIds = [...new Set(assignments.map((a) => a.batchId))];
    const batchRooms = await prisma.chatRoom.findMany({
      where: { instituteId, batchId: { in: batchIds } },
      select: Model.chatRoomSelect,
      orderBy: { createdAt: 'desc' },
    });
    const rooms: Model.ChatRoomRow[] = [...batchRooms];
    if (batchIds.length > 0) {
      const announcementRoom = await prisma.chatRoom.findFirst({
        where: { instituteId, type: 'ANNOUNCEMENT', batchId: null },
        select: Model.chatRoomSelect,
      });
      if (announcementRoom) rooms.unshift(announcementRoom);
    }
    return Model.ok(rooms);
  } catch {
    return Model.fail('Failed to fetch chat rooms', 'INTERNAL_ERROR');
  }
}

async function svcGetChatMessages(
  teacherId: string,
  instituteId: string,
  chatRoomId: string,
  limit = 50,
  before?: string
): Promise<Model.ServiceResult<Model.ChatMessageRow[]>> {
  try {
    const chatRoom = await prisma.chatRoom.findFirst({
      where: { id: chatRoomId, instituteId },
    });
    if (!chatRoom) return Model.fail('Chat room not found', 'NOT_FOUND');
    if (chatRoom.type === 'ANNOUNCEMENT' && chatRoom.batchId === null) {
      const hasAssignment = await prisma.teacherSubject.findFirst({
        where: { teacherId, instituteId },
      });
      if (!hasAssignment) return Model.fail('Access denied', 'FORBIDDEN');
    } else {
      const hasAccess = await prisma.teacherSubject.findFirst({
        where: { teacherId, instituteId, batchId: chatRoom.batchId ?? undefined },
      });
      if (!hasAccess) return Model.fail('Access denied to this chat room', 'FORBIDDEN');
    }
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

async function svcSendMessage(
  teacherId: string,
  instituteId: string,
  chatRoomId: string,
  input: Model.SendMessageInput
): Promise<Model.ServiceResult<Model.ChatMessageRow>> {
  if (!input.content?.trim()) return Model.fail('Message content is required', 'VALIDATION_ERROR');
  try {
    const chatRoom = await prisma.chatRoom.findFirst({ where: { id: chatRoomId, instituteId } });
    if (!chatRoom) return Model.fail('Chat room not found', 'NOT_FOUND');
    if (chatRoom.type === 'ANNOUNCEMENT' && chatRoom.batchId === null) {
      const hasAssignment = await prisma.teacherSubject.findFirst({
        where: { teacherId, instituteId },
      });
      if (!hasAssignment) return Model.fail('Access denied', 'FORBIDDEN');
    } else {
      const hasAccess = await prisma.teacherSubject.findFirst({
        where: { teacherId, instituteId, batchId: chatRoom.batchId ?? undefined },
      });
      if (!hasAccess) return Model.fail('Access denied to this chat room', 'FORBIDDEN');
    }
    const message = await prisma.chatMessage.create({
      data: {
        chatRoomId,
        senderId: teacherId,
        content: input.content,
        messageType: input.messageType || MessageType.TEXT,
        fileUrl: input.fileUrl,
        isAnnouncement: input.isAnnouncement || false,
      },
      select: Model.chatMessageSelect,
    });
    if (input.isAnnouncement && chatRoom.batchId) {
      const enrollments = await prisma.enrollment.findMany({
        where: { batchId: chatRoom.batchId },
        select: { studentId: true },
      });
      await prisma.notification.createMany({
        data: enrollments.map((e) => ({
          userId: e.studentId,
          type: NotificationType.ANNOUNCEMENT,
          title: 'New Announcement',
          message: input.content.substring(0, 100),
          entityId: message.id,
        })),
      });
    }
    await publishChatMessageEvent({ roomId: chatRoomId, message });
    return Model.ok(message);
  } catch {
    return Model.fail('Failed to send message', 'INTERNAL_ERROR');
  }
}

async function svcPinMessage(
  teacherId: string,
  instituteId: string,
  chatRoomId: string,
  messageId: string
): Promise<Model.ServiceResult<Model.ChatMessageRow>> {
  try {
    const chatRoom = await prisma.chatRoom.findFirst({ where: { id: chatRoomId, instituteId } });
    if (!chatRoom) return Model.fail('Chat room not found', 'NOT_FOUND');
    const hasAccess =
      chatRoom.batchId === null
        ? await prisma.teacherSubject.findFirst({ where: { teacherId, instituteId } })
        : await prisma.teacherSubject.findFirst({
            where: { teacherId, instituteId, batchId: chatRoom.batchId },
          });
    if (!hasAccess) return Model.fail('Access denied to this chat room', 'FORBIDDEN');
    const message = await prisma.chatMessage.findFirst({
      where: { id: messageId, chatRoomId },
    });
    if (!message) return Model.fail('Message not found', 'NOT_FOUND');
    return Model.ok(
      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { isPinned: true, pinnedAt: new Date() },
        select: Model.chatMessageSelect,
      })
    );
  } catch {
    return Model.fail('Failed to pin message', 'INTERNAL_ERROR');
  }
}

async function svcUnpinMessage(
  teacherId: string,
  instituteId: string,
  chatRoomId: string,
  messageId: string
): Promise<Model.ServiceResult<Model.ChatMessageRow>> {
  try {
    const chatRoom = await prisma.chatRoom.findFirst({ where: { id: chatRoomId, instituteId } });
    if (!chatRoom) return Model.fail('Chat room not found', 'NOT_FOUND');
    const hasAccess =
      chatRoom.batchId === null
        ? await prisma.teacherSubject.findFirst({ where: { teacherId, instituteId } })
        : await prisma.teacherSubject.findFirst({
            where: { teacherId, instituteId, batchId: chatRoom.batchId },
          });
    if (!hasAccess) return Model.fail('Access denied to this chat room', 'FORBIDDEN');
    const message = await prisma.chatMessage.findFirst({
      where: { id: messageId, chatRoomId },
    });
    if (!message) return Model.fail('Message not found', 'NOT_FOUND');
    return Model.ok(
      await prisma.chatMessage.update({
        where: { id: messageId },
        data: { isPinned: false, pinnedAt: null },
        select: Model.chatMessageSelect,
      })
    );
  } catch {
    return Model.fail('Failed to unpin message', 'INTERNAL_ERROR');
  }
}

async function svcGetPinnedMessages(
  teacherId: string,
  instituteId: string,
  chatRoomId: string
): Promise<Model.ServiceResult<Model.ChatMessageRow[]>> {
  try {
    const chatRoom = await prisma.chatRoom.findFirst({ where: { id: chatRoomId, instituteId } });
    if (!chatRoom) return Model.fail('Chat room not found', 'NOT_FOUND');
    const hasAccess =
      chatRoom.batchId === null
        ? await prisma.teacherSubject.findFirst({ where: { teacherId, instituteId } })
        : await prisma.teacherSubject.findFirst({
            where: { teacherId, instituteId, batchId: chatRoom.batchId },
          });
    if (!hasAccess) return Model.fail('Access denied to this chat room', 'FORBIDDEN');
    return Model.ok(
      await prisma.chatMessage.findMany({
        where: { chatRoomId, isPinned: true },
        select: Model.chatMessageSelect,
        orderBy: { pinnedAt: 'desc' },
      })
    );
  } catch {
    return Model.fail('Failed to fetch pinned messages', 'INTERNAL_ERROR');
  }
}

async function svcSendInstituteAnnouncement(
  teacherId: string,
  instituteId: string,
  content: string,
  messageType?: MessageType,
  fileUrl?: string
): Promise<Model.ServiceResult<Model.ChatMessageRow>> {
  if (!content?.trim()) return Model.fail('Announcement content is required', 'VALIDATION_ERROR');
  try {
    const hasAssignment = await prisma.teacherSubject.findFirst({
      where: { teacherId, instituteId },
    });
    if (!hasAssignment) return Model.fail('Access denied', 'FORBIDDEN');

    let room = await prisma.chatRoom.findFirst({
      where: { instituteId, type: 'ANNOUNCEMENT', batchId: null },
    });
    if (!room) {
      room = await prisma.chatRoom.create({
        data: {
          instituteId,
          type: 'ANNOUNCEMENT',
          name: 'Institute Announcements',
          messagingMode: 'ADMIN_ONLY',
        },
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { batch: { instituteId } },
      select: { studentId: true },
    });
    const uniqueStudentIds = [...new Set(enrollments.map((e) => e.studentId))];

    const message = await prisma.$transaction(async (tx) => {
      const msg = await tx.chatMessage.create({
        data: {
          chatRoomId: room.id,
          senderId: teacherId,
          content,
          messageType: messageType || MessageType.TEXT,
          fileUrl,
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

async function svcReorderUnits(
  teacherId: string,
  instituteId: string,
  updates: { id: string; orderIndex: number }[]
): Promise<Model.ServiceResult<{ updated: number }>> {
  try {
    let updated = 0;
    for (const { id, orderIndex } of updates) {
      const unit = await prisma.unit.findFirst({ where: { id, instituteId } });
      if (!unit) continue;
      const hasAccess = await prisma.teacherSubject.findFirst({
        where: { teacherId, instituteId, subjectId: unit.subjectId },
      });
      if (!hasAccess) continue;
      await prisma.unit.update({ where: { id }, data: { orderIndex } });
      updated++;
    }
    return Model.ok({ updated });
  } catch {
    return Model.fail('Failed to reorder units', 'INTERNAL_ERROR');
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

export async function getAssignedSubjects(req: Request, res: Response) {
  return send(res, await svcGetAssignedSubjects(req.user!.id, req.user!.instituteId));
}

export async function getAssignedBatches(req: Request, res: Response) {
  return send(res, await svcGetAssignedBatches(req.user!.id, req.user!.instituteId));
}

export async function getBatchStudents(req: Request<{ batchId: string }>, res: Response) {
  return send(
    res,
    await svcGetBatchStudents(req.user!.id, req.user!.instituteId, req.params.batchId)
  );
}

export async function markAttendance(
  req: Request<unknown, unknown, Model.MarkAttendanceRequest>,
  res: Response
) {
  const { studentId, batchId, subjectId, date, status } = req.body;
  if (!studentId || !batchId || !date || !status) {
    return res.status(400).json({ error: 'studentId, batchId, date and status are required' });
  }
  return send(
    res,
    await svcMarkAttendance(req.user!.id, req.user!.instituteId, {
      studentId,
      batchId,
      subjectId,
      date: new Date(date),
      status: AttendanceStatus[status],
    }),
    201
  );
}

export async function bulkMarkAttendance(
  req: Request<unknown, unknown, Model.BulkAttendanceRequest>,
  res: Response
) {
  const { batchId, subjectId, date, records } = req.body;
  if (!batchId || !date || !records?.length) {
    return res.status(400).json({ error: 'batchId, date and records are required' });
  }
  return send(
    res,
    await svcBulkMarkAttendance(req.user!.id, req.user!.instituteId, {
      batchId,
      subjectId,
      date: new Date(date),
      records: records.map((r) => ({ studentId: r.studentId, status: AttendanceStatus[r.status] })),
    })
  );
}

export async function getAttendance(
  req: Request<unknown, unknown, unknown, Model.AttendanceQueryParams>,
  res: Response
) {
  return send(res, await svcGetAttendance(req.user!.id, req.user!.instituteId, req.query));
}

export async function getResources(
  req: Request<unknown, unknown, unknown, Model.ResourceQueryParams>,
  res: Response
) {
  return send(res, await svcGetResources(req.user!.id, req.user!.instituteId, req.query));
}

export async function createResource(
  req: Request<unknown, unknown, Model.CreateResourceRequest>,
  res: Response
) {
  const { batchId, subjectId, unitId, title, fileUrl, description, fileType } = req.body;
  if (!batchId || !title || !fileUrl) {
    return res.status(400).json({ error: 'batchId, title and fileUrl are required' });
  }
  return send(
    res,
    await svcCreateResource(req.user!.id, req.user!.instituteId, {
      batchId,
      subjectId,
      unitId,
      title,
      fileUrl,
      description,
      fileType,
    }),
    201
  );
}

export async function updateResource(
  req: Request<{ resourceId: string }, unknown, Model.UpdateResourceRequest>,
  res: Response
) {
  return send(
    res,
    await svcUpdateResource(req.user!.id, req.user!.instituteId, req.params.resourceId, req.body)
  );
}

export async function deleteResource(req: Request<{ resourceId: string }>, res: Response) {
  const result = await svcDeleteResource(
    req.user!.id,
    req.user!.instituteId,
    req.params.resourceId
  );
  if (!result.success) return send(res, result);
  return res.json({ message: 'Resource deleted successfully' });
}

export async function getUnits(req: Request<{ subjectId: string }>, res: Response) {
  return send(res, await svcGetUnits(req.user!.id, req.user!.instituteId, req.params.subjectId));
}

export async function createUnit(
  req: Request<unknown, unknown, Model.CreateUnitRequest>,
  res: Response
) {
  const { subjectId, name, description, orderIndex } = req.body;
  if (!subjectId || !name) {
    return res.status(400).json({ error: 'subjectId and name are required' });
  }
  return send(
    res,
    await svcCreateUnit(req.user!.id, req.user!.instituteId, {
      subjectId,
      name,
      description,
      orderIndex,
    }),
    201
  );
}

export async function updateUnit(
  req: Request<{ unitId: string }, unknown, Model.UpdateUnitRequest>,
  res: Response
) {
  return send(
    res,
    await svcUpdateUnit(req.user!.id, req.user!.instituteId, req.params.unitId, req.body)
  );
}

export async function deleteUnit(req: Request<{ unitId: string }>, res: Response) {
  const result = await svcDeleteUnit(req.user!.id, req.user!.instituteId, req.params.unitId);
  if (!result.success) return send(res, result);
  return res.json({ message: 'Unit deleted successfully' });
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
      isAnnouncement: false,
    }),
    201
  );
}

export async function sendAnnouncement(
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
      isAnnouncement: true,
    }),
    201
  );
}

export async function sendInstituteAnnouncement(
  req: Request<unknown, unknown, Model.SendMessageRequest>,
  res: Response
) {
  const { content, messageType, fileUrl } = req.body;
  if (!content) return res.status(400).json({ error: 'content is required' });
  return send(
    res,
    await svcSendInstituteAnnouncement(
      req.user!.id,
      req.user!.instituteId,
      content,
      messageType ? MessageType[messageType] : undefined,
      fileUrl
    ),
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

export async function pinMessage(
  req: Request<{ chatRoomId: string; messageId: string }>,
  res: Response
) {
  return send(
    res,
    await svcPinMessage(
      req.user!.id,
      req.user!.instituteId,
      req.params.chatRoomId,
      req.params.messageId
    )
  );
}

export async function unpinMessage(
  req: Request<{ chatRoomId: string; messageId: string }>,
  res: Response
) {
  return send(
    res,
    await svcUnpinMessage(
      req.user!.id,
      req.user!.instituteId,
      req.params.chatRoomId,
      req.params.messageId
    )
  );
}

export async function getPinnedMessages(req: Request<{ chatRoomId: string }>, res: Response) {
  return send(
    res,
    await svcGetPinnedMessages(req.user!.id, req.user!.instituteId, req.params.chatRoomId)
  );
}

export async function reorderUnits(
  req: Request<unknown, unknown, Model.ReorderUnitsRequest>,
  res: Response
) {
  const { units } = req.body;
  if (!units?.length) return res.status(400).json({ error: 'units array is required' });
  return send(res, await svcReorderUnits(req.user!.id, req.user!.instituteId, units));
}

// --- Batch Summary ---

async function svcGetBatchSummary(
  teacherId: string,
  instituteId: string,
  batchId: string
): Promise<Model.ServiceResult<Model.BatchSummary>> {
  try {
    // Verify teacher is assigned to this batch
    const assignment = await prisma.teacherSubject.findFirst({
      where: { teacherId, batchId },
    });
    if (!assignment) return Model.fail('Not assigned to this batch', 'FORBIDDEN');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const [batch, enrollments, todayAttendance, allAttendance, resources, messages] =
      await Promise.all([
        prisma.batch.findFirst({
          where: { id: batchId, instituteId },
          select: { id: true, name: true, course: { select: { name: true } } },
        }),
        prisma.enrollment.findMany({
          where: { batchId, instituteId },
          select: { status: true },
        }),
        prisma.attendance.findMany({
          where: { batchId, instituteId, date: today },
          select: { status: true },
        }),
        prisma.attendance.findMany({
          where: { batchId, instituteId },
          select: { status: true },
        }),
        prisma.resource.count({
          where: { batchId, instituteId },
        }),
        prisma.chatMessage.count({
          where: {
            chatRoom: { batchId, instituteId },
            createdAt: { gte: last24h },
          },
        }),
      ]);

    if (!batch) return Model.fail('Batch not found', 'NOT_FOUND');

    const recentResources = await prisma.resource.count({
      where: { batchId, instituteId, createdAt: { gte: last7Days } },
    });

    const activeEnrollments = enrollments.filter((e) => e.status === 'ACTIVE').length;
    const presentCount = allAttendance.filter((a) => a.status === 'PRESENT').length;
    const totalAttendance = allAttendance.length;

    return Model.ok({
      batch: {
        id: batch.id,
        name: batch.name,
        courseName: batch.course.name,
      },
      students: {
        total: enrollments.length,
        active: activeEnrollments,
      },
      attendance: {
        todayPresent: todayAttendance.filter((a) => a.status === 'PRESENT').length,
        todayAbsent: todayAttendance.filter((a) => a.status === 'ABSENT').length,
        todayLate: todayAttendance.filter((a) => a.status === 'LATE').length,
        overallPercentage:
          totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0,
      },
      resources: {
        total: resources,
        recentWeek: recentResources,
      },
      messages: {
        last24h: messages,
      },
    });
  } catch {
    return Model.fail('Failed to fetch batch summary', 'INTERNAL_ERROR');
  }
}

export async function getBatchSummary(req: Request<{ batchId: string }>, res: Response) {
  return send(
    res,
    await svcGetBatchSummary(req.user!.id, req.user!.instituteId, req.params.batchId)
  );
}
