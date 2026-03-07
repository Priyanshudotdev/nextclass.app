import { Router } from 'express';
import { UserRole } from 'db';
import { requireRole } from '../../middlewares/require-role';
import * as Service from './service';

const router = Router();

router.use(requireRole(UserRole.PARENT));

router.get('/profile', Service.getProfile);
router.patch('/profile', Service.updateProfile);

router.get('/children', Service.getChildren);
router.get('/children/:studentId', Service.getChildProfile);
router.get('/children/:studentId/summary', Service.getChildSummary);
router.get('/children/:studentId/enrollments', Service.getChildEnrollments);
router.get('/children/:studentId/attendance', Service.getChildAttendance);
router.get('/children/:studentId/batches/:batchId/subjects', Service.getChildSubjects);
router.get('/children/:studentId/batches/:batchId/resources', Service.getChildResources);
router.get('/children/:studentId/batches/:batchId/teachers', Service.getChildTeachers);

router.get('/notifications', Service.getNotifications);
router.patch('/notifications/:notificationId/read', Service.markNotificationRead);
router.patch('/notifications/read-all', Service.markAllNotificationsRead);

export default router;
