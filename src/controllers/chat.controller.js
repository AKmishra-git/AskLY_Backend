import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";

export async function sendMessage(req, res) {
    const { message, chatId } = req.body;

    let title = null, chat = null;

    if (!chatId) {
        title = await generateChatTitle(message);
        chat = await chatModel.create({ user: req.user.userId, title });
    }

    const currentChatId = chatId || chat._id;

    const userMessage = await messageModel.create({ 
        chat: currentChatId,
        content: message,
        role: 'user'
    });

    const messages = await messageModel.find({ chat: currentChatId });
    const result = await generateResponse(messages, req.user.userId);

    const aiMessage = await messageModel.create({
        chat: currentChatId,
        content: result,
        role: 'ai'
    });

    res.status(200).json({
        success: true,
        reply: aiMessage.content,
        title,
        chat,
        
    });
}

export async function getChats(req,res){
    const user = req.user;
    const chats = await chatModel.find({ user: user.userId });

    res.status(200).json({
        success: true,
        chats
    });
}

export async function getChatMessages(req,res){

    const { chatId } = req.params;

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.userId       

    
    })

    if (!chat) {
        return res.status(404).json({
            success: false,
            message: "Chat not found"
        });
    }

    const messages = await messageModel.find({ chat: chatId });

    res.status(200).json({
        success: true,
        messages
    });
}

export async function deleteChat(req,res) {

    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.userId
    }); 

    if (!chat) {
        return res.status(404).json({
            success: false,
            message: "Chat not found"
        });
    }

    await messageModel.deleteMany({ chat: chatId });

    res.status(200).json({
        success: true,
        message: "Chat deleted successfully"
    });
}

