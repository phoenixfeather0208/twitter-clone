import { compare } from "bcrypt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const isExistingUser: any = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!isExistingUser) {
      return NextResponse.json(
        { error: "Email does not exist" },
        { status: 400 }
      );
    }

    if (!isExistingUser.verified) {
      return NextResponse.json(
        { error: "Verify your email." },
        { status: 400 }
      );
    }

    const isPasswordValid = await compare(password, isExistingUser.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Password is incorrect" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, user: isExistingUser });
  } catch (error) {
    const result = error as Error;
    return NextResponse.json({ error: result.message }, { status: 500 });
  }
}
