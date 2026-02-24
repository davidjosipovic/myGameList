import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export default async function middleware(req: NextRequest) {
  // Get the pathname of the request (e.g. /, /protected)
  const path = req.nextUrl.pathname;

  // If it's the root path, just render it
  if (path === "/") {
    return NextResponse.next();
  }

  const session = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (session && path === "/login" || session && path === "/register") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if(!session){
    if(path==="/editprofile"){
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Analytics – admin only
  if (path.startsWith("/analytics")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    const email = (session.email as string || "").toLowerCase();
    if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email)) {
      return NextResponse.rewrite(new URL("/analytics/forbidden", req.url));
    }
  }

  if (path === "/profile") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();


}