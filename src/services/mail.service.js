import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

async function createTransporter() {
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const accessToken = await oauth2Client.getAccessToken();

  if (!accessToken.token) {
    throw new Error("Failed to generate access token");
  }

  return nodemailer.createTransport({
    service: "gmail", // ✅ IMPORTANT (don’t use host+port here)
    auth: {
      type: "OAuth2",
      user: process.env.GOOGLE_USER,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });
}



export async function sendEmail({ to, subject, html, text }) {
  if (!to) throw new Error("'to' field is empty");

  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"Askly" <${process.env.GOOGLE_USER}>`,
      to,
      subject,
      html,
      text,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;

  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
    throw error;
  }
}