"use client";
 
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Search, Play, CheckCircle2, Zap } from "lucide-react";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/gigs?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.background}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
        <div className={styles.grid}></div>
      </div>

      <div className={`container ${styles.container}`}>
        <div className={styles.content}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="section-label"
          >
            <span className={styles.pulse}></span>
            Uganda's Leading Freelance Marketplace
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={styles.title}
          >
            Hire the Best <span className="text-gradient">Talent</span>.<br />
            Find Your Best <span className="text-gradient">Work</span>.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={styles.subtitle}
          >
            The ultimate bridge between high-growth companies and exceptional freelancers. 
            A hybrid marketplace designed for trust, speed, and professional excellence.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={styles.searchBar}
            onSubmit={handleSearch}
          >
            <div className={styles.searchInputWrapper}>
              <Search className={styles.searchIcon} size={20} />
              <input 
                type="text" 
                placeholder="Search for 'UI/UX Design', 'HR Audit', or 'Payroll'..." 
                className={styles.searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">Search Gigs</button>
          </motion.form>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={styles.actions}
          >
            <div className={styles.mainActions}>
              <Link href="/auth/signup?role=employer" className="btn btn-primary btn-lg">
                I want to Hire <ArrowRight size={18} />
              </Link>
              <Link href="/auth/signup?role=freelancer" className="btn btn-outline btn-lg">
                I want to Work
              </Link>
            </div>
            <button className={styles.watchDemo}>
              <div className={styles.playIcon}>
                <Play size={14} fill="currentColor" />
              </div>
              <span>Watch how it works</span>
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className={styles.features}
          >
            <div className={styles.feature}>
              <CheckCircle2 size={16} className={styles.featureIcon} />
              <span>Verified Professionals</span>
            </div>
            <div className={styles.feature}>
              <CheckCircle2 size={16} className={styles.featureIcon} />
              <span>Secure Payments</span>
            </div>
            <div className={styles.feature}>
              <CheckCircle2 size={16} className={styles.featureIcon} />
              <span>24/7 Support</span>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={styles.visual}
        >
          <div className={styles.cardStack}>
            <div className={`${styles.floatingCard} ${styles.card1}`}>
              <div className={styles.avatar}></div>
              <div className={styles.cardLines}>
                <div className={styles.lineLong}></div>
                <div className={styles.lineShort}></div>
              </div>
              <div className={styles.badge}>Expert</div>
            </div>
            <div className={`${styles.floatingCard} ${styles.card2}`}>
              <div className={styles.statsIcon}></div>
              <div className={styles.cardLines}>
                <div className={styles.lineShort}></div>
                <div className={styles.lineLong}></div>
              </div>
              <div className={styles.price}>$45/hr</div>
            </div>
            <div className={styles.mainVisual}>
              <div className={styles.visualCircle}></div>
              <div className={styles.visualContent}>
                {/* Image placeholder or illustration would go here */}
                <div className={styles.illustration}>
                   <Zap size={80} className={styles.glowIcon} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
