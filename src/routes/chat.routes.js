import {Router} from 'express';
import {sendMessage, getChats, getChatMessages, deleteChat} from '../controllers/chat.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const chatRouter = Router();

chatRouter.post("/message", authMiddleware, sendMessage)
chatRouter.get("/", authMiddleware, getChats)
chatRouter.get("/:chatId/messages", authMiddleware, getChatMessages)
chatRouter.delete("/:chatId", authMiddleware, deleteChat);

export default chatRouter;