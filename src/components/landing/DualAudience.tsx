import { Link } from "react-router-dom";
import { 
  Building2, 
  UserCircle, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Globe 
} from "lucide-react";
import styles from "./DualAudience.module.css";

export function DualAudience() {
  return (
    <section className="section" id="how-it-works">
      <div className="container">
        <div className="text-center mx-auto" style={{ maxWidth: "800px", marginBottom: "var(--space-3xl)" }}>
          <div className="section-label">Dual-Marketplace Model</div>
          <h2 className="section-title">One Platform. <span className="text-gradient">Unlimited Potential.</span></h2>
          <p className="section-subtitle mx-auto">
            Whether you're looking to scale your team or your career, MainHR Gigs provides the tools 
            and trust you need to succeed in the modern economy.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Employer Card */}
          <div className={`${styles.card} ${styles.employerCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}>
                <Building2 size={32} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>For Hiring Managers</h3>
                <p className={styles.cardSubtitle}>Scale your workforce with precision</p>
              </div>
            </div>
            
            <ul className={styles.benefitList}>
              <li className={styles.benefitItem}>
                <ShieldCheck size={20} className={styles.check} />
                <span>Access pre-vetted top 3% Ugandan talent</span>
              </li>
              <li className={styles.benefitItem}>
                <Zap size={20} className={styles.check} />
                <span>Hire and onboard in under 48 hours</span>
              </li>
              <li className={styles.benefitItem}>
                <Clock size={20} className={styles.check} />
                <span>Centralized payroll and compliance management</span>
              </li>
            </ul>

            <div className={styles.cardFooter}>
              <Link to="/auth/signup?role=employer" className="btn btn-primary">
                Hire Top Talent <ArrowRight size={18} />
              </Link>
              <Link to="/services" className={styles.footerLink}>
                Browse Services
              </Link>
            </div>
            
            <div className={styles.visualPlaceholder}>
              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <span className={styles.statVal}>98%</span>
                  <span className={styles.statLabel}>Success Rate</span>
                </div>
                <div className={styles.statBox}>
                  <span className={styles.statVal}>UGX 2M+</span>
                  <span className={styles.statLabel}>Avg. Savings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Freelancer Card */}
          <div className={`${styles.card} ${styles.freelancerCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapperAlt}>
                <UserCircle size={32} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>For Service Providers</h3>
                <p className={styles.cardSubtitle}>Build a sustainable freelance career</p>
              </div>
            </div>
            
            <ul className={styles.benefitList}>
              <li className={styles.benefitItem}>
                <Globe size={20} className={styles.checkAlt} />
                <span>Work with leading Ugandan & global brands</span>
              </li>
              <li className={styles.benefitItem}>
                <ShieldCheck size={20} className={styles.checkAlt} />
                <span>Guaranteed payments via escrow protection</span>
              </li>
              <li className={styles.benefitItem}>
                <Zap size={20} className={styles.checkAlt} />
                <span>Showcase your portfolio to verified buyers</span>
              </li>
            </ul>

            <div className={styles.cardFooter}>
              <Link to="/auth/signup?role=freelancer" className="btn btn-accent">
                Start Earning <ArrowRight size={18} />
              </Link>
              <Link to="/jobs" className={styles.footerLink}>
                Browse Open Jobs
              </Link>
            </div>

            <div className={styles.visualPlaceholderAlt}>
              <div className={styles.badgeCloud}>
                <span className="badge badge-accent">UI/UX</span>
                <span className="badge badge-accent">Node.js</span>
                <span className="badge badge-accent">HR Audit</span>
                <span className="badge badge-accent">Copywriting</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
