import { Router } from 'express';
import { UserController } from '../controllers/userController';

const router = Router();

router.post('/auth', UserController.authenticate);

export default router; 