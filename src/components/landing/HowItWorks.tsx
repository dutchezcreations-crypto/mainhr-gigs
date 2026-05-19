import { Search, UserPlus, CheckCircle, CreditCard } from "lucide-react";
import styles from "./HowItWorks.module.css";

const steps = [
  {
    title: "Join the Tribe",
    desc: "Create your professional profile as a freelancer or employer. Complete your verification to unlock full access.",
    icon: <UserPlus size={28} />,
  },
  {
    title: "Post or Search",
    desc: "Employers post gigs or search the directory. Freelancers apply to jobs or showcase their packaged services.",
    icon: <Search size={28} />,
  },
  {
    title: "Connect & Collaborate",
    desc: "Use our secure messaging and project management tools to define milestones and start working together.",
    icon: <CheckCircle size={28} />,
  },
  {
    title: "Secure Payments",
    desc: "Funds are held in escrow and released only when milestones are approved. Simple, safe, and transparent.",
    icon: <CreditCard size={28} />,
  },
];

export function HowItWorks() {
  return (
    <section className="section">
      <div className="container">
        <div className="text-center mx-auto" style={{ maxWidth: "700px", marginBottom: "var(--space-4xl)" }}>
          <div className="section-label">Simplified Workflow</div>
          <h2 className="section-title">How <span className="text-gradient">MainHR Gigs</span> Works</h2>
          <p className="section-subtitle mx-auto">
            We've removed the friction from the hiring process. From discovery to payment, 
            everything is handled within one secure ecosystem.
          </p>
        </div>

        <div className={styles.grid}>
          {steps.map((step, index) => (
            <div key={index} className={styles.step}>
              <div className={styles.iconContainer}>
                <div className={styles.iconWrapper}>
                  {step.icon}
                </div>
                {index < steps.length - 1 && <div className={styles.connector}></div>}
                <div className={styles.stepNumber}>{index + 1}</div>
              </div>
              <div className={styles.content}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
