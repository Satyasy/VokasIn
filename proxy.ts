import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeSession, SESSION_COOKIE_NAME } from "@/lib/auth";

const ROLE_BY_PREFIX = {
  "/guru": "guru_produktif",
  "/kaprogli": "kaprogli",
} as const;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const prefix = (Object.keys(ROLE_BY_PREFIX) as (keyof typeof ROLE_BY_PREFIX)[]).find((p) =>
    pathname.startsWith(p)
  );
  if (!prefix) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== ROLE_BY_PREFIX[prefix]) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/guru/:path*", "/kaprogli/:path*"],
};
