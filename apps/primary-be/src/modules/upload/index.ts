import { Router } from 'express';
import { createRouteHandler } from 'uploadthing/express';
import { uploadRouter } from '../../lib/uploadthing';

const router = Router();

router.use(
  '/',
  createRouteHandler({
    router: uploadRouter,
    config: {
      token: process.env.UPLOADTHING_TOKEN,
    },
  })
);

export default router;
