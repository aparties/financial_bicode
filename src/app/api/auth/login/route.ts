import { NextResponse } from "next/server";
import { signSession } from "@/lib/auth-utils";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const expectedUsername = process.env.DASHBOARD_USERNAME || "admin";
    const expectedPassword = process.env.DASHBOARD_PASSWORD || "admin123";

    if (username !== expectedUsername || password !== expectedPassword) {
      return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
    }

    // Set session cookie valid for 1 day
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 1 day
    const token = signSession({ username, expiresAt });

    const response = NextResponse.json({ success: true });
    
    // In Next.js, response.cookies.set returns the cookie or sets it
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
