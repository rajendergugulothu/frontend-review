import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import {
  ADMIN_SESSION_COOKIE,
  adminApiSecret,
  backendBaseUrl,
  isValidAdminSessionValue,
} from "./admin-config"

export async function hasAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  return isValidAdminSessionValue(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)
}

export function unauthorizedAdminResponse(): NextResponse {
  return NextResponse.json({ detail: "Unauthorized" }, { status: 401 })
}

export function adminConfigErrorResponse(detail: string): NextResponse {
  return NextResponse.json({ detail }, { status: 503 })
}

export async function proxyBackendRequest(
  path: string,
  init: RequestInit = {}
): Promise<NextResponse> {
  const baseUrl = backendBaseUrl()
  if (!baseUrl) {
    return adminConfigErrorResponse("Backend API base URL is not configured")
  }

  const secret = adminApiSecret()
  if (!secret) {
    return adminConfigErrorResponse("Admin API secret is not configured")
  }

  const upstreamResponse = await fetch(`${baseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "x-admin-secret": secret,
      ...(init.headers || {}),
    },
  })

  const responseText = await upstreamResponse.text()
  return new NextResponse(responseText, {
    status: upstreamResponse.status,
    headers: {
      "content-type": upstreamResponse.headers.get("content-type") || "application/json",
    },
  })
}
