import { Router } from 'express';
import { UserRole } from 'db';
import { authMiddleware } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/require-role';
import * as studentService from './service';

const router = Router();

router.use(authMiddleware);
router.use(requireRole(UserRole.STUDENT));

router.get('/dashboard', studentService.getDashboard);

router.get('/profile', studentService.getProfile);
router.patch('/profile', studentService.updateProfile);

router.get('/enrollments', studentService.getEnrollments);

router.get('/attendance', studentService.getAttendance);

router.get('/subjects', studentService.getSubjects);

router.get('/resources', studentService.getResources);
router.get('/resources/subject/:subjectId', studentService.getResources);

router.get('/chatrooms', studentService.getChatRooms);
router.get('/chatrooms/:chatRoomId/messages', studentService.getChatMessages);
router.post('/chatrooms/:chatRoomId/messages', studentService.sendMessage);

router.get('/notifications', studentService.getNotifications);
router.patch('/notifications/:notificationId/read', studentService.markNotificationRead);
router.patch('/notifications/read-all', studentService.markAllNotificationsRead);

export default router;
