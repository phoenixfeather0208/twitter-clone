import { NextResponse } from "next/server";
import { compare, hash } from "bcrypt";

export async function GET(req: Request, route: { params: { email: string } }) {
  const email = route.params.email;
  const response = NextResponse.redirect(process.env.NEXTAUTH_URL as string);
  const hashed_email = await hash(email, 10);
  response.cookies.set("verify", hashed_email);
  return response;
}

export async function POST(req: Request) {
  const { email, verify } = await req.json();

  const isMatch = await compare(email, verify);
  console.log(email, verify, isMatch);
  return NextResponse.json({ isMatch });
}
