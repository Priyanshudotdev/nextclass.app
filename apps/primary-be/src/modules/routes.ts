/**
 * Modules Router
 *
 * Central router that aggregates all module routes.
 * Add new modules here by importing their router and mounting them.
 */

import { Router } from 'express';
import authRouter from './auth';
import studentRouter from './student';
import adminRouter from './admin';
import teacherRouter from './teacher';
import parentRouter from './parent';
import uploadRouter from './upload';

const router = Router();

// Mount module routers
router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/student', studentRouter);
router.use('/teacher', teacherRouter);
router.use('/parent', parentRouter);
router.use('/uploadthing', uploadRouter);

export default router;
