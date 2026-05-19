import { 
  ShieldCheck, 
  Zap, 
  Target, 
  MessageSquare, 
  BadgeCheck, 
  Banknote 
} from "lucide-react";
import styles from "./WhyChooseUs.module.css";

const features = [
  {
    title: "Vetted Professionals",
    desc: "Every freelancer goes through a multi-step vetting process including skill tests and ID verification.",
    icon: <BadgeCheck size={24} />,
  },
  {
    title: "Escrow Protection",
    desc: "Payments are held in secure escrow and only released when you're 100% satisfied with the delivery.",
    icon: <ShieldCheck size={24} />,
  },
  {
    title: "Fast Matching",
    desc: "Our AI matching engine connects you with the best available talent for your specific needs in minutes.",
    icon: <Zap size={24} />,
  },
  {
    title: "Local Expertise",
    desc: "Deep understanding of the Ugandan labor market, compliance, and professional standards.",
    icon: <Target size={24} />,
  },
  {
    title: "Seamless Communication",
    desc: "Built-in video calls, file sharing, and project management tools to keep everything in one place.",
    icon: <MessageSquare size={24} />,
  },
  {
    title: "Competitive Pricing",
    desc: "Low platform fees for freelancers and transparent pricing tiers for businesses of all sizes.",
    icon: <Banknote size={24} />,
  },
];

export function WhyChooseUs() {
  return (
    <section className="section">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.content}>
            <div className="section-label">The MainHR Advantage</div>
            <h2 className="section-title">Built for Trust, Designed for <span className="text-gradient">Performance</span></h2>
            <p className="section-subtitle">
              We're not just another directory. We're a comprehensive ecosystem that 
              handles the complexities of the modern gig economy so you don't have to.
            </p>
            
            <div className={styles.featureGrid}>
              {features.map((feature, index) => (
                <div key={index} className={styles.featureItem}>
                  <div className={styles.iconBox}>
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className={styles.featureTitle}>{feature.title}</h4>
                    <p className={styles.featureDesc}>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.visual}>
             <div className={styles.visualContainer}>
                {/* Visual representation of trust/security */}
                <div className={styles.badgeLarge}>
                  <ShieldCheck size={120} strokeWidth={1} />
                  <div className={styles.glow}></div>
                </div>
                <div className={styles.floatingStats}>
                   <div className={styles.statItem}>
                      <span className={styles.statDot}></span>
                      99.9% Payment Security
                   </div>
                   <div className={styles.statItem}>
                      <span className={styles.statDot}></span>
                      24/7 Dispute Resolution
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
