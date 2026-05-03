import {Router} from 'express';
import { validateRegister, handleValidationErrors, validateLogin } from '../validators/auth.validator.js';
import { registerController, verifyEmailController, loginController, getMeController } from '../controllers/auth.controller.js';
import { auth } from 'googleapis/build/src/apis/abusiveexperiencereport/index.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const authRouter = Router();

authRouter.post('/register', validateRegister, handleValidationErrors, registerController);
authRouter.post('/login', validateLogin, handleValidationErrors, loginController);
authRouter.get('/get-me', authMiddleware, getMeController);
authRouter.get('/verify-email',verifyEmailController);

export default authRouter;