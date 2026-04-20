import { NextRequest, NextResponse } from "next/server"

import {
  ADMIN_SESSION_COOKIE,
  adminEmail,
  adminPassword,
  adminSessionSecret,
} from "../../../../../lib/admin-config"

export async function POST(request: NextRequest) {
  const configuredEmail = adminEmail()
  const configuredPassword = adminPassword()
  const sessionSecret = adminSessionSecret()

  if (!configuredEmail || !configuredPassword || !sessionSecret) {
    return NextResponse.json(
      { detail: "Admin login is not fully configured" },
      { status: 503 }
    )
  }

  const body = (await request.json().catch(() => null)) as
    | { email?: string; password?: string }
    | null
  const submittedEmail = body?.email?.trim().toLowerCase() || ""
  const submittedPassword = body?.password?.trim() || ""

  if (
    !submittedEmail ||
    !submittedPassword ||
    submittedEmail !== configuredEmail ||
    submittedPassword !== configuredPassword
  ) {
    return NextResponse.json({ detail: "Invalid email or password" }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: sessionSecret,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  })
  return response
}
