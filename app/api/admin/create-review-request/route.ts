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
    body: JSON.stringify(body ?? {}),
  })
}
