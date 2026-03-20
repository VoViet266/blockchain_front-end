import { Router } from 'express';
const router = Router();



router.use('/auth', require('./authRoutes').default);


export default router;