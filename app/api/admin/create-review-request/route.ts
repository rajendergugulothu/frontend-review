import {
  hasAdminSession,
  proxyBackendRequest,
  unauthorizedAdminResponse,
} from "../../../../lib/admin-server"

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return unauthorizedAdminResponse()
  }

  const body = await request.json().catch(() => null)
  return proxyBackendRequest("/create-review-request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
  })
}
