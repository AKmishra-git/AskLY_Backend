import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";
import { header } from "express-validator";

export async function registerController(req, res) {
    const { username, email, password } = req.body;

    try {
        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ email }, { username }]
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                success: false,
                message: "User with this email or username already exists"
            });
        }

        const newUser = await userModel.create({ username, email, password });

        const emailVerificationToken = jwt.sign(
            { email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        // 🔥 HARDCODED BACKEND URL
        const verifyLink = `https://askly-backend.onrender.com/api/auth/verify-email?token=${emailVerificationToken}`;

        await sendEmail({
            to: email,
            subject: "Verify your email - Askly",
            html: `
                <h2>Hello ${username}</h2>

                <p>Thank you for registering with Askly. We’re delighted to have you on board.</p>

                <p>Please verify your email by clicking the link below:</p>

                <a href="${verifyLink}" target="_blank">Verify Email</a>

                <p>If you did not create this account, you can ignore this email.</p>

                <br/>
                <p>Best regards,<br/>Askly Team</p>
            `,
            text: `Hello ${username}, please verify your email: ${verifyLink}`
        });

        res.status(201).json({
            success: true,
            message: "User registered successfully. Please check your email.",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Error in registerController:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while registering the user"
        });
    }
}

export async function verifyEmailController(req, res) {
    const token = req.query.token;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid token or user does not exist"
            });
        }

        user.verified = true;
        await user.save();

        // 🔥 HARDCODED FRONTEND URL
        const html = `
            <h1>Email Verified Successfully!</h1>
            <p>You can now log in to your account.</p>
            <a href="https://askly-dev.netlify.app/login">Go to Login</a>
        `;

        res.send(html);

    } catch (error) {
        console.error("Error in verifyEmailController:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while verifying the email"
        });
    }
}

export async function loginController(req, res) {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User does not exist"
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }

        if (!user.verified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email before logging in"
            });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );


        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            message: "Login successful",
            token,
            user:{
                id: user._id,
                username: user.username,
                email: user.email
            }
            
            
        });



    }
    catch (error) {
        console.error('Error in loginController:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred while logging in"
        });
    }

}

export async function getMeController(req, res) {
    const userId = req.user.userId;

    try{


        const user = await userModel.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200). json({
            success: true,
            user
        });
    }

     catch (error) {
    console.error('Error in getMeController:', error);
    res.status(500).json({
        success: false,
        message: "An error occurred while fetching user data"
    });

}
}


