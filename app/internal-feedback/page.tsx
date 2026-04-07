"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import styles from "./page.module.css"
import BrandLogo from "../../components/BrandLogo"
import { apiUrl } from "../../lib/api"

function FeedbackPageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitFeedback = async () => {
    if (!token || submitting) return

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedFeedback = feedback.trim()

    if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address or leave it blank.")
      return
    }
    if (!trimmedFeedback) {
      setError("Please share what happened.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch(apiUrl("/submit-feedback"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          name: trimmedName || null,
          email: trimmedEmail || null,
          feedback: trimmedFeedback,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      setSubmitted(true)
    } catch {
      setSubmitting(false)
      setError("We could not submit your feedback. Please try again.")
    }
  }

  if (submitted) {
    return (
      <main className={styles.page}>
        <section className={styles.successCard}>
          <div className={styles.successHeader}>
            <BrandLogo />
            <span className={styles.successBadge}>Feedback Received</span>
          </div>
          <h1 className={styles.successTitle}>Thank you for sharing details</h1>
          <p className={styles.successSubtitle}>
            Our team will review your notes, follow up where needed, and use them to
            improve the customer experience.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <aside className={styles.introPanel}>
          <BrandLogo align="left" />
          <p className={styles.eyebrow}>Service Recovery</p>
          <h1 className={styles.title}>Help us understand what went wrong</h1>
          <p className={styles.subtitle}>
            Your notes go directly to our internal team for follow-up and process
            improvements. This form is private and helps us respond better.
          </p>
          <div className={styles.pillRow}>
            <span className={styles.infoPill}>Private follow-up</span>
            <span className={styles.infoPill}>Internal team review</span>
          </div>
          <div className={styles.guidanceCard}>
            <p className={styles.guidanceLabel}>Helpful Details</p>
            <ul className={styles.guidanceList}>
              <li>What happened during your visit</li>
              <li>Anything we could have handled better</li>
              <li>What outcome would feel right to you</li>
            </ul>
          </div>
        </aside>

        <div className={styles.formPanel}>
          <div className={styles.panelHeader}>
            <p className={styles.panelEyebrow}>Internal Feedback</p>
            <h2 className={styles.panelTitle}>Share the details with our team</h2>
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
                disabled={submitting || !token}
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
                disabled={submitting || !token}
              />
            </label>
          </div>

          <div className={styles.feedbackPanel}>
            <label htmlFor="feedback-text" className={styles.label}>
              What happened?
            </label>
            <textarea
              id="feedback-text"
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              className={styles.textarea}
              rows={7}
              placeholder="Describe your experience, including anything we could have handled better."
              maxLength={1200}
            />
            <p className={styles.counter}>{feedback.length} / 1200</p>
          </div>

          {!token && (
            <p className={styles.error}>
              Missing token in this URL. Please use the link from the review request.
            </p>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="button"
            onClick={submitFeedback}
            disabled={
              !feedback.trim() ||
              submitting ||
              !token
            }
            className={styles.submitButton}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </section>
    </main>
  )
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={null}>
      <FeedbackPageContent />
    </Suspense>
  )
}
