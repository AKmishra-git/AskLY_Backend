import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import chatRouter from './routes/chat.routes.js';
import pdfRoutes from "./routes/pdf.routes.js";
import cors from 'cors';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173', // Update this to your frontend URL
    credentials: true   
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);
app.use('/api/chats', chatRouter);

app.use("/api/pdf", pdfRoutes);


export default app;