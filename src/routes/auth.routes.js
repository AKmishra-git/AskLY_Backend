import {Router} from 'express';
import { validateRegister, handleValidationErrors, validateLogin } from '../validators/auth.validator.js';
import { registerController, verifyEmailController, loginController, getMeController } from '../controllers/auth.controller.js';

import { authMiddleware } from '../middleware/auth.middleware.js';

const authRouter = Router();

authRouter.post('/register', validateRegister, handleValidationErrors, registerController);
authRouter.post('/login', validateLogin, handleValidationErrors, loginController);
authRouter.get('/get-me', authMiddleware, getMeController);
authRouter.get('/verify-email',verifyEmailController);

authRouter.get("/test", (req, res) => {
  res.send("Auth route working");
});

export default authRouter;