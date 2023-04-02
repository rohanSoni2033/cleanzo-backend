import { Router } from 'express';
import {
    updateMeController
} from '../controllers/userController.js';

import { authenticate } from '../controllers/authController.js';
const router = Router();


router.patch('/update-me', authenticate, updateMeController);

export default router;
