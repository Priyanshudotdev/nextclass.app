import { Router } from 'express';
import { UserRole } from 'db';
import { requireRole } from '../../middlewares/auth';
import * as Service from './service';

const router = Router();

router.use(requireRole(UserRole.TEACHER));

router.get('/profile', Service.getProfile);
router.patch('/profile', Service.updateProfile);

router.get('/subjects', Service.getAssignedSubjects);
router.get('/batches', Service.getAssignedBatches);
router.get('/batches/:batchId/students', Service.getBatchStudents);
router.get('/batches/:batchId/summary', Service.getBatchSummary);

router.get('/attendance', Service.getAttendance);
router.post('/attendance', Service.markAttendance);
router.post('/attendance/bulk', Service.bulkMarkAttendance);

router.get('/resources', Service.getResources);
router.post('/resources', Service.createResource);
router.patch('/resources/:resourceId', Service.updateResource);
router.delete('/resources/:resourceId', Service.deleteResource);

router.get('/subjects/:subjectId/units', Service.getUnits);
router.post('/units', Service.createUnit);
router.patch('/units/:unitId', Service.updateUnit);
router.delete('/units/:unitId', Service.deleteUnit);
router.patch('/units/reorder', Service.reorderUnits);

router.get('/chat-rooms', Service.getChatRooms);
router.get('/chat-rooms/:chatRoomId/messages', Service.getChatMessages);
router.get('/chat-rooms/:chatRoomId/pinned', Service.getPinnedMessages);
router.post('/chat-rooms/:chatRoomId/messages', Service.sendMessage);
router.post('/chat-rooms/:chatRoomId/announcements', Service.sendAnnouncement);
router.post('/chat-rooms/:chatRoomId/messages/:messageId/pin', Service.pinMessage);
router.delete('/chat-rooms/:chatRoomId/messages/:messageId/pin', Service.unpinMessage);

export default router;
