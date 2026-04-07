"use client"

import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import styles from "./page.module.css"
import { apiUrl } from "../../lib/api"

type Review = {
  id?: string | number
  client_name?: string | null
  client_email?: string | null
  rating?: number | null
  status?: string | null
  feedback?: string | null
}

type Analytics = {
  average_rating: number
  total_reviews: number
  positive_reviews: number
  negative_reviews: number
  total_requests: number
  requests_sent: number
  completed_reviews: number
  pending_requests: number
}

type OfficeQrInfo = {
  office_code: string
  office_name?: string
  landing_url: string
  qr_image_url: string
}

const DEFAULT_OFFICE_SLUG = "urban-country-management"
const DEFAULT_OFFICE_NAME = "Urban Country Management"

const EMPTY_ANALYTICS: Analytics = {
  average_rating: 0,
  total_reviews: 0,
  positive_reviews: 0,
  negative_reviews: 0,
  total_requests: 0,
  requests_sent: 0,
  completed_reviews: 0,
  pending_requests: 0,
}

const formatStatus = (status?: string | null) =>
  (status || "unknown").replaceAll("_", " ")

const getStatusClassName = (status?: string | null) => {
  if (status === "completed") return styles.statusCompleted
  if (status === "feedback_received") return styles.statusFeedback
  return styles.statusOpen
}

const formatStars = (rating?: number | null) => {
  if (typeof rating !== "number") return "Not rated"
  const normalized = Math.max(1, Math.min(5, Math.round(rating)))
  return `${"\u2605".repeat(normalized)}${"\u2606".repeat(5 - normalized)}`
}

export default function AdminPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Analytics>(EMPTY_ANALYTICS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastSynced, setLastSynced] = useState("Not synced yet")
  const [runningReminders, setRunningReminders] = useState(false)
  const [reminderMessage, setReminderMessage] = useState<string | null>(null)
  const [officeQr, setOfficeQr] = useState<OfficeQrInfo | null>(null)
  const [officeQrError, setOfficeQrError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadDashboard = async () => {
      setLoading(true)
      setError(null)

      try {
        const [reviewsRes, analyticsRes] = await Promise.all([
          fetch(apiUrl("/admin/reviews")),
          fetch(apiUrl("/admin/analytics")),
        ])

        if (!reviewsRes.ok || !analyticsRes.ok) {
          throw new Error("Failed to load admin data")
        }

        const reviewsData: unknown = await reviewsRes.json()
        const analyticsData: Partial<Analytics> = await analyticsRes.json()

        if (!isMounted) return

        setReviews(Array.isArray(reviewsData) ? (reviewsData as Review[]) : [])
        setStats({
          average_rating: Number(analyticsData.average_rating ?? 0),
          total_reviews: Number(analyticsData.total_reviews ?? 0),
          positive_reviews: Number(analyticsData.positive_reviews ?? 0),
          negative_reviews: Number(analyticsData.negative_reviews ?? 0),
          total_requests: Number(analyticsData.total_requests ?? 0),
          requests_sent: Number(analyticsData.requests_sent ?? 0),
          completed_reviews: Number(analyticsData.completed_reviews ?? 0),
          pending_requests: Number(analyticsData.pending_requests ?? 0),
        })
        setLastSynced(new Date().toLocaleString())
      } catch {
        if (!isMounted) return

        setReviews([])
        setStats(EMPTY_ANALYTICS)
        setError("Unable to load dashboard data. Please refresh and try again.")
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const completedCount = useMemo(
    () => reviews.filter((review) => review.status === "completed").length,
    [reviews]
  )

  const feedbackRequestCount = useMemo(
    () => Math.max(reviews.length - completedCount, 0),
    [completedCount, reviews.length]
  )

  const positiveShare = useMemo(() => {
    if (stats.total_reviews === 0) return 0
    return Math.round((stats.positive_reviews / stats.total_reviews) * 100)
  }, [stats.positive_reviews, stats.total_reviews])

  const completionShare = useMemo(() => {
    if (stats.total_requests === 0) return 0
    return Math.round((stats.completed_reviews / stats.total_requests) * 100)
  }, [stats.completed_reviews, stats.total_requests])

  const statCards = [
    {
      label: "Average Rating",
      value: stats.average_rating.toFixed(2),
      helper: `${positiveShare}% positive sentiment`,
      toneClass: styles.statToneSky,
    },
    {
      label: "Total Reviews",
      value: String(stats.total_reviews),
      helper: `${completionShare}% completion rate`,
      toneClass: styles.statToneSlate,
    },
    {
      label: "Requests Sent",
      value: String(stats.requests_sent),
      helper: `${stats.pending_requests} still pending`,
      toneClass: styles.statToneSlate,
    },
    {
      label: "Positive Reviews",
      value: String(stats.positive_reviews),
      helper: "Promoters and highly rated feedback",
      toneClass: styles.statToneMint,
    },
    {
      label: "Negative Reviews",
      value: String(stats.negative_reviews),
      helper: "Follow-up candidates",
      toneClass: styles.statToneCoral,
    },
  ] as const

  const runRemindersNow = async () => {
    setRunningReminders(true)
    setReminderMessage(null)
    try {
      const response = await fetch(apiUrl("/admin/process-reminders"), {
        method: "POST",
      })
      if (!response.ok) {
        throw new Error("Reminder job failed")
      }
      const data = (await response.json()) as {
        attempted?: number
        sent?: number
        failed?: number
      }
      setReminderMessage(
        `Reminders processed. Attempted ${data.attempted ?? 0}, sent ${
          data.sent ?? 0
        }, failed ${data.failed ?? 0}.`
      )
    } catch {
      setReminderMessage("Reminder job failed. Check backend logs and configuration.")
    } finally {
      setRunningReminders(false)
    }
  }

  const generateOfficeQr = async () => {
    setOfficeQrError(null)
    setOfficeQr(null)
    try {
      const response = await fetch(
        apiUrl(`/office/${encodeURIComponent(DEFAULT_OFFICE_SLUG)}/qr`)
      )
      if (!response.ok) {
        throw new Error("Failed QR request")
      }
      const data = (await response.json()) as OfficeQrInfo
      setOfficeQr(data)
    } catch {
      setOfficeQrError("Unable to generate office QR. Check backend service.")
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroBackdrop} aria-hidden="true" />
          <div className={styles.heroPrimary}>
            <p className={styles.liveBadge}>
              <span className={styles.liveDot} />
              Operations Console - Live
            </p>
            <p className={styles.eyebrow}>Urban Country Management Review Ops</p>
            <h1 className={styles.title}>
              Review
              <br />
              Intelligence
              <br />
              <span className={styles.titleAccent}>Dashboard</span>
            </h1>
            <p className={styles.subtitle}>
              Track sentiment shifts, completion quality, and follow-up risk all in
              one place for the {DEFAULT_OFFICE_NAME}.
            </p>
            <div className={styles.metaRow}>
              <span className={styles.metaPill}>Updated: {lastSynced}</span>
              <span className={styles.metaPill}>Completed: {completedCount}</span>
              <span className={styles.metaPill}>Feedback Requests: {feedbackRequestCount}</span>
            </div>
            <div className={styles.actionRow}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={runRemindersNow}
                disabled={runningReminders}
              >
                {runningReminders ? "Running Reminder Job..." : "Run Reminder Job"}
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={generateOfficeQr}
              >
                Generate Management QR
              </button>
            </div>
            {reminderMessage && <p className={styles.actionMessage}>{reminderMessage}</p>}
          </div>

          <aside className={styles.heroVisual}>
            <article className={styles.previewCard}>
              <div className={styles.previewScene}>
                <Image
                  src="/admin-hero-collage.jpg"
                  alt="City collage artwork for the Urban Country Management dashboard"
                  fill
                  priority
                  className={styles.previewImage}
                />
                <div className={styles.previewOverlay} />
                <div className={styles.previewRatingBadge}>
                  <strong>{stats.average_rating.toFixed(1)}</strong>
                  <span>Urban Country Management</span>
                </div>
                <div className={styles.previewFooter}>
                  <span className={styles.previewLocationBadge}>Active location</span>
                  <h2 className={styles.previewTitle}>Urban Country Management</h2>
                  <p className={styles.previewCopy}>
                    Urban Country Realty and Property Management
                  </p>
                  <p className={styles.previewMeta}>
                    {positiveShare}% positive sentiment with {stats.pending_requests} requests pending.
                  </p>
                </div>
              </div>
            </article>
          </aside>
        </section>

        {loading && <p className={styles.loading}>Loading dashboard metrics...</p>}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.dashboardGrid}>
          <section className={styles.statsPanel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelEyebrow}>Performance Snapshot</p>
                <h2 className={styles.panelTitle}>Operational Metrics</h2>
              </div>
              <p className={styles.panelSubtitle}>
                A live pulse on review volume, sentiment, and follow-up workload.
              </p>
            </div>

            <section className={styles.statsGrid}>
              {statCards.map((card) => (
                <article
                  key={card.label}
                  className={`${styles.statCard} ${card.toneClass}`}
                >
                  <p className={styles.statLabel}>{card.label}</p>
                  <p className={styles.statValue}>{card.value}</p>
                  <p className={styles.statHelper}>{card.helper}</p>
                </article>
              ))}
            </section>
          </section>

          <section className={styles.qrPanel}>
            <p className={styles.panelEyebrow}>In-Office Capture</p>
            <h2 className={styles.qrTitle}>{DEFAULT_OFFICE_NAME} QR</h2>
            <p className={styles.qrSubtitle}>
              Generate a ready-to-share QR that opens the office review intake page.
            </p>
            <div className={styles.qrControls}>
              <button type="button" className={styles.actionButton} onClick={generateOfficeQr}>
                Generate QR
              </button>
            </div>
            {officeQrError && <p className={styles.error}>{officeQrError}</p>}
            {officeQr ? (
              <div className={styles.qrResult}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={officeQr.qr_image_url}
                  alt={`QR code for ${officeQr.office_name || DEFAULT_OFFICE_NAME}`}
                />
                <div className={styles.qrMeta}>
                  <p className={styles.qrLinkLabel}>Landing Page</p>
                  <a href={officeQr.landing_url} target="_blank" rel="noreferrer">
                    {officeQr.landing_url}
                  </a>
                </div>
              </div>
            ) : (
              <div className={styles.qrPlaceholder}>
                <p className={styles.qrPlaceholderTitle}>QR preview will appear here</p>
                <p className={styles.qrPlaceholderText}>
                  Use this for reception desks, office signage, or event check-ins.
                </p>
              </div>
            )}
          </section>
        </div>

        <section className={styles.tablePanel}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Recent Client Reviews</h2>
            <p className={styles.tableSubtitle}>
              Ratings, workflow state, and captured follow-up text
            </p>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Email</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyRow}>
                      {loading ? "Loading reviews..." : "No reviews found."}
                    </td>
                  </tr>
                ) : (
                  reviews.map((review, index) => (
                    <tr key={review.id ?? `${review.client_name ?? "review"}-${index}`}>
                      <td>
                        <div className={styles.clientCell}>
                          <span className={styles.clientBadge}>
                            {(review.client_name || "U").slice(0, 1).toUpperCase()}
                          </span>
                          <span>{review.client_name || "Unknown client"}</span>
                        </div>
                      </td>
                      <td className={styles.emailCell}>{review.client_email || "-"}</td>
                      <td>
                        <div className={styles.ratingCell}>
                          <span className={styles.ratingValue}>
                            {typeof review.rating === "number"
                              ? review.rating.toFixed(1)
                              : "-"}
                          </span>
                          <span className={styles.ratingStars}>
                            {formatStars(review.rating)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`${styles.statusPill} ${getStatusClassName(review.status)}`}
                        >
                          {formatStatus(review.status)}
                        </span>
                      </td>
                      <td className={styles.feedbackCell}>
                        {review.feedback || "No text submitted"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
