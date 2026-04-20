import { hasAdminSession, proxyBackendRequest, unauthorizedAdminResponse } from "../../../../lib/admin-server"

export async function GET() {
  if (!(await hasAdminSession())) {
    return unauthorizedAdminResponse()
  }

  return proxyBackendRequest("/admin/analytics")
}
