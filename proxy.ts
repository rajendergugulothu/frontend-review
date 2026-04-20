import { NextRequest, NextResponse } from "next/server"

import {
  ADMIN_LOGIN_PATH,
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionValue,
} from "./lib/admin-config"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const hasValidSession = isValidAdminSessionValue(sessionCookie)

  if (pathname === ADMIN_LOGIN_PATH) {
    if (hasValidSession) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    return NextResponse.next()
  }

  if (hasValidSession) {
    return NextResponse.next()
  }

  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url)
  loginUrl.searchParams.set("next", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/admin/:path*"],
}
