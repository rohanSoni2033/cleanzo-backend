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
router.post("/member/login", memberLoginController);

// add a member
// router.post("/admin/members", createMemberAccount);

export default router;
