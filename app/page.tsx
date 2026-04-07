import Link from "next/link"
import BrandLogo from "../components/BrandLogo"
import styles from "./page.module.css"

const journeyCards = [
  {
    title: "Automated Review Routing",
    description:
      "Launch review requests after lease signing, move-in, work order completion, or renewal without manual follow-up.",
  },
  {
    title: "Smart Response Handling",
    description:
      "Send happy clients to public review platforms and guide low ratings into internal recovery before they spill outward.",
  },
  {
    title: "Urban Country Management Ready",
    description:
      "Use one branded review flow for Urban Country Management with QR access, admin visibility, and reminder tracking built in.",
  },
]

const triggerEvents = [
  "Lease signing",
  "Move-in",
  "Work order completion",
  "Lease renewal",
]

const channels = ["Email", "SMS", "WhatsApp"]

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <BrandLogo align="left" />
          <p className={styles.eyebrow}>Urban Country Realty Review Hub</p>
          <h1 className={styles.title}>
            Turn property management moments into trusted public reviews.
          </h1>
          <p className={styles.subtitle}>
            Send branded review requests for Urban Country Management, route high ratings to
            public platforms, capture low ratings privately, and keep the team aware
            in real time.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/office/urban-country-management">
              Start Review Flow
            </Link>
            <Link className={styles.secondaryAction} href="/admin">
              Open Admin Dashboard
            </Link>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaPill}>Office: Urban Country Management</span>
            <span className={styles.metaPill}>Channels: Email, SMS, WhatsApp</span>
            <span className={styles.metaPill}>Low ratings route to internal feedback</span>
          </div>
        </div>

        <div className={styles.heroPanel}>
          <div className={styles.heroPanelHeader}>
            <p className={styles.panelEyebrow}>Review Journey</p>
            <h2 className={styles.panelTitle}>What this system handles today</h2>
          </div>

          <div className={styles.cardGrid}>
            {journeyCards.map((card) => (
              <article key={card.title} className={styles.featureCard}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.infoGrid}>
        <article className={styles.infoPanel}>
          <p className={styles.panelEyebrow}>Automations</p>
          <h2 className={styles.infoTitle}>Trigger events</h2>
          <ul className={styles.list}>
            {triggerEvents.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className={styles.infoPanel}>
          <p className={styles.panelEyebrow}>Outreach</p>
          <h2 className={styles.infoTitle}>Supported channels</h2>
          <ul className={styles.list}>
            {channels.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className={styles.infoPanel}>
          <p className={styles.panelEyebrow}>Operations</p>
          <h2 className={styles.infoTitle}>Next actions</h2>
          <div className={styles.quickLinks}>
            <Link href="/admin">Review dashboard metrics</Link>
            <Link href="/office/urban-country-management">Open office intake form</Link>
            <Link href="/internal-feedback?token=demo">Preview internal feedback page</Link>
          </div>
        </article>
      </section>
    </main>
  )
}
