import { Router } from 'express';
import {
  login,
  verifyOTP,
  memberLogin,
} from '../controllers/authController.js';

const router = Router();

router.post('/login', login);
router.post('/verify-otp', verifyOTP);

router.post('/member/login', memberLogin);
// router.post("/admin/login", adminLogin);

export default router;
