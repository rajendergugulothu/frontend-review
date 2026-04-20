"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import styles from "./page.module.css"
import BrandLogo from "../../../components/BrandLogo"
import { apiUrl } from "../../../lib/api"

type SubmitRatingResponse = {
  redirect_url?: string
  detail?: string
}

export default function RatePage() {
  const params = useParams()
  const token =
    typeof params.token === "string" ? params.token : params.token?.[0] ?? ""

  const [loading, setLoading] = useState(false)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [feedback, setFeedback] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [lowRatingRedirectUrl, setLowRatingRedirectUrl] = useState<string | null>(null)

  const submitRating = async () => {
    if (!token || loading) return

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedFeedback = feedback.trim()

    if (selectedRating === null) {
      setError("Please choose a star rating first.")
      return
    }
    if (!trimmedName) {
      setError("Please enter your name.")
      return
    }
    if (!trimmedEmail) {
      setError("Please enter your email.")
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await fetch(apiUrl("/submit-rating"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          rating: selectedRating,
          name: trimmedName,
          email: trimmedEmail,
          feedback: trimmedFeedback || null,
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
          // Keep fallback message when response body is not JSON.
        }
        throw new Error(detail)
      }

      const data: SubmitRatingResponse = await response.json()
      if (!data.redirect_url) {
        throw new Error("Missing redirect URL")
      }

      if (selectedRating <= 3) {
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            `review-contact:${token}`,
            JSON.stringify({
              name: trimmedName,
              email: trimmedEmail,
            })
          )
        }
        setLowRatingRedirectUrl(data.redirect_url)
        setLoading(false)
        return
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
        <BrandLogo />
        <p className={styles.eyebrow}>Customer Check-in</p>
        <h1 className={styles.title}>How was your recent experience?</h1>
        <p className={styles.subtitle}>
          Choose a score from 1 to 5 stars. Your response helps us improve service
          quality quickly.
        </p>

        <div className={styles.formGrid}>
          <label className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Your Name</span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={styles.input}
              placeholder="Jane Smith"
              maxLength={120}
              disabled={loading || !token}
            />
          </label>

          <label className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Your Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={styles.input}
              placeholder="jane@example.com"
              maxLength={180}
              disabled={loading || !token}
            />
          </label>
        </div>

        <label className={styles.fieldGroup}>
          <span className={styles.fieldLabel}>Additional Feedback (Optional)</span>
          <textarea
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            className={styles.textarea}
            rows={4}
            placeholder="Share any details you want our team to know."
            maxLength={1200}
            disabled={loading || !token}
          />
        </label>

        <div className={styles.starRow} role="group" aria-label="Rate your experience">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedRating(star)}
              className={`${styles.starButton} ${
                selectedRating !== null && star <= selectedRating ? styles.starActive : ""
              }`}
              disabled={loading || !token}
              aria-label={`Rate ${star} out of 5`}
              title={`${star} out of 5`}
            >
              {"\u2605"}
            </button>
          ))}
        </div>

        {selectedRating !== null && (
          <p className={styles.selectionLabel}>Selected score: {selectedRating} / 5</p>
        )}

        {loading && (
          <p className={styles.loading} aria-live="polite">
            Submitting your rating...
          </p>
        )}

        {!token && (
          <p className={styles.error}>
            Missing token in this URL. Please open the rating link from the request
            message.
          </p>
        )}

        {error && <p className={styles.error}>{error}</p>}

        <button
          type="button"
          className={styles.submitButton}
          onClick={submitRating}
          disabled={
            loading ||
            !token ||
            selectedRating === null ||
            !name.trim() ||
            !email.trim()
          }
        >
          {loading ? "Submitting..." : "Continue"}
        </button>

        <div className={styles.scaleRow}>
          <span>Poor</span>
          <span>Excellent</span>
        </div>
      </section>

      {lowRatingRedirectUrl && (
        <div className={styles.modalBackdrop} role="presentation">
          <section
            className={styles.modalCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="low-rating-title"
          >
            <p className={styles.modalEyebrow}>We Want To Make This Right</p>
            <h2 id="low-rating-title" className={styles.modalTitle}>
              We are sorry for your experience.
            </h2>
            <p className={styles.modalCopy}>
              Please tell us what happened so our internal team can review it and
              follow up quickly.
            </p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalButton}
                onClick={() => window.location.replace(lowRatingRedirectUrl)}
              >
                Continue
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
