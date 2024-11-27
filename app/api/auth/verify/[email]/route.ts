import { NextResponse } from "next/server";
import { compare, hash } from "bcrypt";
import prisma from "@/lib/prismadb";

export async function GET(req: Request, route: { params: { email: string } }) {
  const email = route.params.email;
  await prisma?.user.update({
    where: {
      email,
    },
    data: {
      verified: true,
    },
  });
  const response = NextResponse.redirect(process.env.NEXTAUTH_URL as string);

  return response;
}

export async function POST(req: Request) {
  const { email, verify } = await req.json();

  const isMatch = await compare(email, verify);
  console.log(email, verify, isMatch);
  return NextResponse.json({ isMatch });
}
