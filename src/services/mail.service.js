import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html, text }) {
  if (!to) throw new Error("'to' field is empty");

  try {
    const { data, error } = await resend.emails.send({
      from: 'Askly <onboarding@resend.dev>', // use this until you add your domain
      to,
      subject,
      html,
      text,
    });

    if (error) throw new Error(error.message);

    console.log("✅ Email sent:", data.id);
    return data;

  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
    throw error;
  }
}