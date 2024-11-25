import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import nodemailer from "nodemailer";

import prisma from "@/lib/prismadb";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url); // check const { userId } = req.query;
    const step = searchParams.get("step");

    if (step === "1") {
      const { email } = await req.json(); // check const { name, username, bio, profileImage, coverImage } = req.body;

      const isExistingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (isExistingUser) {
        return NextResponse.json(
          { error: "email already exists" },
          { status: 400 }
        );
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_SERVER, // For Gmail SMTP server
        port: 587, // For secure connection
        secure: false, // Use TLS
        auth: {
          user: process.env.SMTP_USER, // Your email address
          pass: process.env.SMTP_PASS, // Your email password or app-specific password
        },
      });

      // Send email
      const info = await transporter.sendMail({
        from: process.env.SMTP_USER, // Sender address
        to: email, // Recipient address
        subject: "Verify your email.", // Subject line
        text: "Verify email", // Plain text body
        html: `<a href="${process.env.NEXTAUTH_URL}/api/auth/verify/${email}">${process.env.NEXTAUTH_URL}/api/auth/verify/${email}</a>`, // HTML body
      });

      console.log(info.messageId);
      return NextResponse.json({ success: true });
    } else if (step === "2") {
      const { email, username, name, password } = await req.json();

      const isExistingUsername = await prisma.user.findUnique({
        where: { username },
      });

      if (isExistingUsername) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }

      const hashedpassword = await hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          username,
          name,
          password: hashedpassword,
        },
      });

      if (!user) {
        return NextResponse.json({ status: 500 });
      }

      return NextResponse.json(user, { status: 200 });
    }
  } catch (error) {
    const result = error as Error;
    return NextResponse.json({ error: result.message }, { status: 400 });
  }
}
