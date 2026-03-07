import { Router } from 'express';
import {
  adminRegistrationHandler,
  getCurrentUserHandler,
  logoutUserHandler,
  userLoginHandler,
  userRegistrationHandler,
} from './service';
import { authMiddleware } from '../../middlewares/auth';

const router = Router();

/* General Routes for USER */
router.route('/signup').post(userRegistrationHandler); // For users joining existing institute
router.route('/register').post(adminRegistrationHandler); // For admin creating new institute
router.route('/login').post(userLoginHandler);
router.route('/me').get(authMiddleware, getCurrentUserHandler);
router.route('/logout').get(authMiddleware, logoutUserHandler);

export default router;
