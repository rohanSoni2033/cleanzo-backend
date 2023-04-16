import { Router } from 'express';
import {
  loginController,
  verifyOTPController,
  memberLoginController,
} from '../controllers/authController.js';

const router = Router();

// users
router.post('/login', loginController);
router.post('/verify-otp', verifyOTPController);

// members
router.post('/member/login', memberLoginController);

export default router;
