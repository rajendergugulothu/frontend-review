"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import styles from "./page.module.css"
import BrandLogo from "../../components/BrandLogo"
import { apiUrl } from "../../lib/api"

function FeedbackPageContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || typeof window === "undefined") return

    const savedContact = window.sessionStorage.getItem(`review-contact:${token}`)
    if (!savedContact) return

    try {
      const parsed = JSON.parse(savedContact) as { name?: string; email?: string }
      setContactName(parsed.name?.trim() || "")
      setContactEmail(parsed.email?.trim() || "")
    } catch {
      // Ignore malformed saved contact data.
    }
  }, [token])

  const submitFeedback = async () => {
    if (!token || submitting) return

    const trimmedFeedback = feedback.trim()
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
          feedback: trimmedFeedback,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit feedback")
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(`review-contact:${token}`)
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

          <div className={styles.contactPanel}>
            <p className={styles.contactTitle}>We will use the details from your rating</p>
            <p className={styles.contactCopy}>
              {contactName || contactEmail
                ? `Following up for ${contactName || "this customer"}${
                    contactEmail ? ` at ${contactEmail}` : ""
                  }.`
                : "Your name and email from the previous step will be used for follow-up."}
            </p>
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
