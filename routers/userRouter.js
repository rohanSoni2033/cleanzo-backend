import { Router } from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
} from '../controllers/userController.js';

import {
  accessPermission,
  protectRoute,
} from '../controllers/authController.js';
const router = Router();

router
  .get('/', protectRoute, accessPermission('admin'), getAllUsers)
  .post('/', protectRoute, accessPermission('admin'), createUser);

router
  .route('/:id')
  .get(protectRoute, accessPermission('admin'), getUser)
  .patch(protectRoute, accessPermission('admin'), updateUser)
  .delete(protectRoute, accessPermission('admin'), deleteUser);

router.route('/member').get(getAllUsers);

export default router;
