"use client"

import { FormEvent, Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import BrandLogo from "../../../components/BrandLogo"
import styles from "./page.module.css"

function AdminLoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") || "/admin"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (loading) return

    const trimmedEmail = email.trim()
    const trimmedPassword = password.trim()
    if (!trimmedEmail) {
      setError("Enter the admin email to continue.")
      return
    }
    if (!trimmedPassword) {
      setError("Enter the admin password to continue.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      })

      if (!response.ok) {
        let detail = "We could not sign you in."
        try {
          const errorBody = (await response.json()) as { detail?: string }
          if (errorBody?.detail) {
            detail = errorBody.detail
          }
        } catch {
          // Keep fallback message if the response is not JSON.
        }

        throw new Error(detail)
      }

      router.replace(nextPath)
      router.refresh()
    } catch (caughtError) {
      setLoading(false)
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not sign you in."
      )
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.logoWrap}>
          <BrandLogo />
        </div>
        <p className={styles.eyebrow}>Admin Access</p>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>Enter your credentials to continue</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Admin Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={styles.input}
              placeholder="admin@example.com"
              autoComplete="email"
              disabled={loading}
            />
          </label>

          <label className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Admin Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={styles.input}
              placeholder="Enter your admin password"
              autoComplete="current-password"
              disabled={loading}
            />
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className={styles.securityNote}>Your admin session is protected and secure</div>
      </section>
    </main>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginPageContent />
    </Suspense>
  )
}
