import { Router } from 'express';
import {
  loginController,
  verifyOTPController,
  authenticate,
  memberLoginController,
  memberVerificationController,
} from '../controllers/authController.js';

const router = Router();

// users
router.post('/login', loginController);
router.post('/verify-otp', verifyOTPController);

// members
router.post("/member/auth/login", memberLoginController);
router.post("/member/auth/verify-otp", memberVerificationController);


// add a member
// router.post("/admin/members", createMemberAccount);

export default router;
