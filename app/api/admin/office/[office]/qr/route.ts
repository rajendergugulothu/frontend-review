import { hasAdminSession, unauthorizedAdminResponse } from "../../../../../../lib/admin-server"
import { backendBaseUrl } from "../../../../../../lib/admin-config"

type Context = {
  params: Promise<{ office: string }>
}

export async function GET(_: Request, context: Context) {
  if (!(await hasAdminSession())) {
    return unauthorizedAdminResponse()
  }

  const baseUrl = backendBaseUrl()
  if (!baseUrl) {
    return Response.json(
      { detail: "Backend API base URL is not configured" },
      { status: 503 }
    )
  }

  const { office } = await context.params
  const upstreamResponse = await fetch(
    `${baseUrl}/office/${encodeURIComponent(office)}/qr`,
    {
      cache: "no-store",
    }
  )

  const responseText = await upstreamResponse.text()
  return new Response(responseText, {
    status: upstreamResponse.status,
    headers: {
      "content-type": upstreamResponse.headers.get("content-type") || "application/json",
    },
  })
}
