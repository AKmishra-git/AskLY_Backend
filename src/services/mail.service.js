import 'dotenv/config';
import nodemailer from "nodemailer";
import { google } from "googleapis";

async function createTransporter() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

     

    console.log("Refresh token loaded:", !!process.env.GOOGLE_REFRESH_TOKEN);

    const tokenResponse = await oauth2Client.getAccessToken();

    if (!tokenResponse.token) {
        throw new Error("Access token is null");
    }

    console.log("Token fetched:", !!tokenResponse.token);

    return nodemailer.createTransport({
        host: "smtp.gmail.com",  // 👈 explicit host instead of service:"gmail"
        port: 465,
        secure: true,
       
        auth: {
            type: "OAuth2",
            user: process.env.GOOGLE_USER,
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
            accessToken: tokenResponse.token,
        },

    })

   

}

export async function sendEmail({ to, subject, html, text }) {
    if (!to) throw new Error("'to' field is empty");

    const transporter = await createTransporter();

    const details = await transporter.sendMail({
        from: `"App Name" <${process.env.GOOGLE_USER}>`,
        to,
        subject,
        html,
        text,
    });

    console.log("Email sent:", details.messageId);
    return details;
}