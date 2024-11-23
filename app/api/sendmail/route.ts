// mlsn.03cd1857664a8d95acc8a45b24e29f729fddd4306950eba7fcb91ecd45154bc4
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (req.method === "POST") {
    const { to, subject, text, html } = await req.json();
    console.log(to);

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.mailersend.net", // For Gmail SMTP server
      port: 587, // For secure connection
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER, // Your email address
        pass: process.env.SMTP_PASS, // Your email password or app-specific password
      },
    });

    try {
      // Send email
      const info = await transporter.sendMail({
        from: process.env.SMTP_USER, // Sender address
        to, // Recipient address
        subject, // Subject line
        text, // Plain text body
        html, // HTML body
      });

      console.log("Email sent:", info.messageId);
      NextResponse.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      NextResponse.json({ success: false, error: "Failed to send email" });
    }
  }
}
