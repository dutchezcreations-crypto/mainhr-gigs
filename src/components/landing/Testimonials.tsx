import { Star, Quote } from "lucide-react";
import styles from "./Testimonials.module.css";

const testimonials = [
  {
    content: "MainHR Gigs transformed our hiring process. We needed a senior HR consultant for an audit, and within 24 hours we were interviewing vetted experts. The quality is unmatched.",
    author: "James Mukasa",
    role: "CEO at CyberVault Foundation",
    avatar: "/avatars/james.jpg"
  },
  {
    content: "As a freelancer, I struggled with late payments and vague requirements. This platform's escrow system and clear milestone structure gave me the confidence to go full-time.",
    author: "Sarah Namayanja",
    role: "Senior UI Designer",
    avatar: "/avatars/sarah.jpg"
  },
  {
    content: "We've built our entire remote engineering team through MainHR. The level of transparency and local compliance support is exactly what we needed to scale in Uganda.",
    author: "David Okello",
    role: "CTO at Ngonzi Community",
    avatar: "/avatars/david.jpg"
  }
];

export function Testimonials() {
  return (
    <section className="section" style={{ background: "var(--color-neutral-50)" }}>
      <div className="container">
        <div className="text-center mx-auto" style={{ maxWidth: "700px", marginBottom: "var(--space-4xl)" }}>
          <div className="section-label">Wall of Love</div>
          <h2 className="section-title">Trusted by <span className="text-gradient">Industry Leaders</span></h2>
        </div>

        <div className={styles.grid}>
          {testimonials.map((t, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.quoteIcon}>
                <Quote size={40} />
              </div>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <p className={styles.content}>{t.content}</p>
              <div className={styles.author}>
                <div className={styles.avatar}></div>
                <div>
                  <h4 className={styles.name}>{t.author}</h4>
                  <p className={styles.role}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
