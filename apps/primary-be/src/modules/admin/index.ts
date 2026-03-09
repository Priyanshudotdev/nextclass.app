import { Router } from 'express';
import { UserRole } from 'db';
import { authMiddleware } from '../../middlewares/auth';
import { requireRole } from '../../middlewares/require-role';
import * as adminService from './service';
const router = Router();

router.use(authMiddleware);
router.use(requireRole(UserRole.ADMIN));

router.get('/dashboard', adminService.getDashboardStats);

router.get('/students', adminService.getStudents);
router.get('/teachers', adminService.getTeachers);

router.post('/users', adminService.createUser);
router.patch('/users/:userId', adminService.updateUser);
router.delete('/users/:userId', adminService.deleteUser);

// ============================================
// Course Management Routes
// ============================================
router.get('/courses', adminService.getCourses);
router.post('/courses', adminService.createCourse);
router.patch('/courses/:courseId', adminService.updateCourse);
router.delete('/courses/:courseId', adminService.deleteCourse);

// ============================================
// Batch Management Routes
// ============================================
router.get('/batches', adminService.getBatches);
router.post('/batches', adminService.createBatch);
router.patch('/batches/:batchId', adminService.updateBatch);
router.delete('/batches/:batchId', adminService.deleteBatch);

// ============================================
// Subject Management Routes
// ============================================
router.get('/subjects', adminService.getSubjects);
router.post('/subjects', adminService.createSubject);
router.patch('/subjects/:subjectId', adminService.updateSubject);
router.delete('/subjects/:subjectId', adminService.deleteSubject);

// ============================================
// Enrollment Management Routes
// ============================================
router.get('/enrollments', adminService.getEnrollments);
router.post('/enrollments', adminService.createEnrollment);
router.delete('/enrollments/:enrollmentId', adminService.deleteEnrollment);

// ============================================
// Parent-Student Management Routes
// ============================================
router.get('/parent-students', adminService.getParentStudents);
router.post('/parent-students', adminService.linkParentStudent);
router.delete('/parent-students/:linkId', adminService.unlinkParentStudent);

// ============================================
// Teacher Assignment Routes
// ============================================
router.get('/teacher-assignments', adminService.getTeacherAssignments);
router.post('/teacher-assignments', adminService.createTeacherAssignment);
router.delete('/teacher-assignments/:assignmentId', adminService.deleteTeacherAssignment);

// ============================================
// Attendance Management Routes
// ============================================
router.get('/attendance', adminService.getAttendance);
router.post('/attendance', adminService.createAttendance);
router.patch('/attendance/:attendanceId', adminService.updateAttendance);
router.delete('/attendance/:attendanceId', adminService.deleteAttendance);

// ============================================
// ChatRoom Management Routes
// ============================================
router.get('/chatrooms', adminService.getChatRooms);
router.post('/chatrooms', adminService.createChatRoom);

// ============================================
// Resource Management Routes
// ============================================
router.get('/resources', adminService.getResources);
router.post('/resources', adminService.createResource);

// ============================================
// Soft Delete Restore Routes
// ============================================
router.get('/deleted/users', adminService.getDeletedUsers);
router.post('/users/:userId/restore', adminService.restoreUser);
router.get('/deleted/courses', adminService.getDeletedCourses);
router.post('/courses/:courseId/restore', adminService.restoreCourse);
router.get('/deleted/batches', adminService.getDeletedBatches);
router.post('/batches/:batchId/restore', adminService.restoreBatch);

// ============================================
// Audit Log Routes
// ============================================
router.get('/audit-logs', adminService.getAuditLogs);

export default router;
