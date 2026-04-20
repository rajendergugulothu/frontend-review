import { hasAdminSession, proxyBackendRequest, unauthorizedAdminResponse } from "../../../../lib/admin-server"

export async function POST() {
  if (!(await hasAdminSession())) {
    return unauthorizedAdminResponse()
  }

  return proxyBackendRequest("/admin/process-reminders", {
    method: "POST",
  })
}
