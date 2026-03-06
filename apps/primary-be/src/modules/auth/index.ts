import { Router } from 'express';
import { logoutUserHandler, userLoginHandler, userRegistrationHandler } from './service';

const router = Router();

/* General Routes for USER */
router.route('/signup').post(userRegistrationHandler);
router.route('/login').post(userLoginHandler);
// router.route('/user/:id').delete(userDeletionHandler);
router.route('/logout').get(logoutUserHandler);

export default router;
