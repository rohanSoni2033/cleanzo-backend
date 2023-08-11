import { Router } from 'express';
import { login, verifyMobile } from '../controllers/authControllers.js';

const router: Router = Router();

router.post('/login', login);
router.post('/verify-mobile', verifyMobile);

export default router;
