import { Link } from "react-router-dom";
import {
  Zap,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
  Linkedin,
  Twitter,
} from "lucide-react";
import { Logo } from "./Logo";
import styles from "./Footer.module.css";

const footerLinks = {
  "For Clients": [
    { label: "How to Hire", href: "/#how-it-works" },
    { label: "Talent Marketplace", href: "/freelancers" },
    { label: "Post a Job", href: "/dashboard/jobs/post" },
    { label: "Enterprise Solutions", href: "/pricing" },
    { label: "Pricing", href: "/pricing" },
  ],
  "For Freelancers": [
    { label: "How to Find Work", href: "/#how-it-works" },
    { label: "Browse Jobs", href: "/jobs" },
    { label: "Create a Profile", href: "/auth/signup" },
    { label: "Skill Tests", href: "/pricing" },
    { label: "Community", href: "/#" },
  ],
  Resources: [
    { label: "Help & Support", href: "mailto:gigs@mainhrug.com" },
    { label: "Trust & Safety", href: "/#" },
    { label: "Terms of Service", href: "/terms" },
  ],
  Company: [
    { label: "About MainHR", href: "/#" },
    { label: "Contact Us", href: "mailto:gigs@mainhrug.com" },
    { label: "Partners", href: "/#" },
  ],
};

export function Footer() {
  return (
    <footer className={styles.footer}>
      {/* CTA Band */}
      <div className={styles.ctaBand}>
        <div className={`container ${styles.ctaInner}`}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>
              Ready to transform how you work?
            </h2>
            <p className={styles.ctaSubtitle}>
              Join thousands of businesses and freelancers already growing on
              MainHR Gigs.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link to="/auth/signup" className="btn btn-white btn-lg">
              Start Hiring <ArrowUpRight size={18} />
            </Link>
            <Link to="/auth/signup" className="btn btn-outline btn-lg" style={{ borderColor: "rgba(255,255,255,0.3)", color: "white" }}>
              Start Earning
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className={styles.main}>
        <div className={`container ${styles.grid}`}>
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <Link to="/" className={styles.logo}>
              <Logo height={30} />
            </Link>
            <p className={styles.brandDesc}>
              Uganda&apos;s leading freelance marketplace. Connecting top talent
              with great opportunities through trust, technology, and
              transparency.
            </p>
            <div className={styles.contactInfo}>
              <a href="tel:+256755407522" className={styles.contactItem}>
                <Phone size={16} />
                +256 755 407522
              </a>
              <a href="mailto:gigs@mainhrug.com" className={styles.contactItem}>
                <Mail size={16} />
                gigs@mainhrug.com
              </a>
              <span className={styles.contactItem}>
                <MapPin size={16} />
                Bukoto, Kampala – Uganda
              </span>
            </div>
            <div className={styles.socials}>
              <a
                href="https://x.com/MainhrU86626"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/main-hr-consult-26937b2ba"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className={styles.linkCol}>
              <h3 className={styles.linkColTitle}>{title}</h3>
              <ul className={styles.linkList}>
                {links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.href} className={styles.link}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottom}>
        <div className={`container ${styles.bottomInner}`}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} MainHR Gigs. All rights reserved.
          </p>
          <div className={styles.bottomLinks}>
            <Link to="/privacy" className={styles.bottomLink}>
              Privacy Policy
            </Link>
            <Link to="/terms" className={styles.bottomLink}>
              Terms of Service
            </Link>
            <Link to="/cookies" className={styles.bottomLink}>
              Cookie Settings
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
