"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import styles from "./page.module.css"
import BrandLogo from "../../../components/BrandLogo"
import { apiUrl } from "../../../lib/api"

type PublicRatingResponse = {
  redirect_url?: string
  detail?: string
}

const DEFAULT_OFFICE_SLUG = "urban-country-management"
const DEFAULT_OFFICE_NAME = "Urban Country Management"

export default function OfficeReviewPage() {
  const params = useParams()
  const office =
    typeof params.office === "string"
      ? params.office
      : params.office?.[0] ?? DEFAULT_OFFICE_SLUG

  const [loading, setLoading] = useState(false)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  const submitRating = async () => {
    if (loading) return
    if (selectedRating === null) {
      setError("Please choose a star rating first.")
      return
    }

    const trimmedEmail = email.trim()
    if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetch(apiUrl("/submit-public-rating"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: selectedRating,
          name: name.trim() || null,
          email: trimmedEmail || null,
          office_code: office,
        }),
      })

      if (!response.ok) {
        let detail = "Failed to submit rating"
        try {
          const errorBody = (await response.json()) as { detail?: string }
          if (errorBody?.detail) {
            detail = errorBody.detail
          }
        } catch {
          // Keep fallback when response is not JSON.
        }
        throw new Error(detail)
      }

      const data: PublicRatingResponse = await response.json()
      if (!data.redirect_url) {
        throw new Error("Missing redirect URL")
      }

      window.location.replace(data.redirect_url)
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "We could not submit your rating. Please try again."
      setLoading(false)
      setError(message)
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <aside className={styles.introPanel}>
          <BrandLogo align="left" />
          <p className={styles.eyebrow}>Urban Country Realty</p>
          <h1 className={styles.title}>How was your experience with {DEFAULT_OFFICE_NAME}?</h1>
          <p className={styles.subtitle}>
            A quick score helps us route your feedback the right way. Great experiences
            can head to Google, and anything below that comes straight to our internal
            team for follow-up.
          </p>
          <div className={styles.pillRow}>
            <span className={styles.infoPill}>5-point rating</span>
            <span className={styles.infoPill}>1 minute to complete</span>
          </div>
        </aside>

        <div className={styles.formPanel}>
          <div className={styles.panelHeader}>
            <p className={styles.panelEyebrow}>Share Your Rating</p>
            <h2 className={styles.panelTitle}>Rate your experience with {DEFAULT_OFFICE_NAME}</h2>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Your Name (Optional)</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={styles.input}
                placeholder="Jane Smith"
                maxLength={120}
                disabled={loading}
              />
            </label>

            <label className={styles.fieldGroup}>
              <span className={styles.fieldLabel}>Your Email (Optional)</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={styles.input}
                placeholder="jane@example.com"
                maxLength={180}
                disabled={loading}
              />
            </label>
          </div>

          <div className={styles.ratingPanel}>
            <div className={styles.ratingHeader}>
              <div>
                <p className={styles.ratingLabel}>Your Rating</p>
                <p className={styles.ratingHint}>Tap a star to choose your experience score.</p>
              </div>
              {selectedRating !== null && (
                <p className={styles.selectionLabel}>Selected: {selectedRating} / 5</p>
              )}
            </div>

            <div className={styles.starRow} role="group" aria-label="Rate your experience">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  className={`${styles.starButton} ${
                    selectedRating !== null && star <= selectedRating ? styles.starActive : ""
                  }`}
                  disabled={loading}
                  aria-label={`Rate ${star} out of 5`}
                  title={`${star} out of 5`}
                >
                  {"\u2605"}
                </button>
              ))}
            </div>

            <div className={styles.scaleRow}>
              <span>Needs attention</span>
              <span>Excellent</span>
            </div>
          </div>

          {loading && (
            <p className={styles.loading} aria-live="polite">
              Submitting your rating...
            </p>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="button"
            className={styles.submitButton}
            onClick={submitRating}
            disabled={loading || selectedRating === null}
          >
            {loading ? "Submitting..." : "Continue"}
          </button>
        </div>
      </section>
    </main>
  )
}
