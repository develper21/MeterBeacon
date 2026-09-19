import { Router } from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';
import { updateUserSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'MANAGER'), getUsers);
router.get('/:id', getUserById);
router.put('/:id', authorize('ADMIN', 'MANAGER'), validateRequest(updateUserSchema), updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;
