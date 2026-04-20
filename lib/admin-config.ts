export const ADMIN_SESSION_COOKIE = "urban_review_admin_session"
export const ADMIN_LOGIN_PATH = "/admin/login"

export function adminEmail(): string {
  return process.env.ADMIN_DASHBOARD_EMAIL?.trim().toLowerCase() || ""
}

export function adminPassword(): string {
  return process.env.ADMIN_DASHBOARD_PASSWORD?.trim() || ""
}

export function adminSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET?.trim() || adminPassword()
}

export function adminApiSecret(): string {
  return process.env.ADMIN_API_SECRET?.trim() || ""
}

export function backendBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/+$/, "") || ""
}

export function isValidAdminSessionValue(value?: string | null): boolean {
  const sessionSecret = adminSessionSecret()
  return Boolean(sessionSecret && value && value === sessionSecret)
}
