import { useState } from "react";
import { 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  Users,
  Briefcase
} from "lucide-react";
import styles from "./PricingPage.module.css";

const plans = [
  {
    name: "Free Starter",
    description: "Ideal for new freelancers and hiring managers exploring the marketplace.",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "Apply to up to 5 jobs / month",
      "Standard commission fee (10%)",
      "Secure escrow payment security",
      "Standard client-specialist messaging",
      "Basic profile and portfolio tools",
      "Standard support email resolution"
    ],
    cta: "Get Started Free",
    href: "/auth/signup",
    popular: false,
    color: "neutral"
  },
  {
    name: "Pro Specialist",
    description: "Best for active freelance professionals and growing Ugandan agencies.",
    priceMonthly: 49000,
    priceYearly: 39000,
    features: [
      "Apply to unlimited jobs / month",
      "Reduced commission fee (5%)",
      "Featured Gig badge on search",
      "Priority list visibility in directory",
      "Escrow payout speed priority",
      "Advanced profile & verified badge",
      "24/7 priority support channel"
    ],
    cta: "Upgrade to Pro",
    href: "/dashboard/billing",
    popular: true,
    color: "primary"
  },
  {
    name: "Enterprise Elite",
    description: "Tailored for premium corporate HR departments and elite agencies.",
    priceMonthly: 149000,
    priceYearly: 119000,
    features: [
      "Zero commission fee (0%!)",
      "Unlimited job posts & search talent",
      "Featured employer listing badge",
      "Dedicated account manager & support",
      "Direct API integrations access",
      "Priority dispute arbitration resolving",
      "Custom billing & invoicing solutions"
    ],
    cta: "Go Enterprise",
    href: "/dashboard/billing",
    popular: false,
    color: "accent"
  }
];

const faqs = [
  {
    q: "How does the escrow payment system protect me?",
    a: "When an employer orders a gig, funds are deducted and held securely by MainHR. Freelancers work with absolute peace of mind knowing the funds are guaranteed. Payment is only released to the freelancer once the employer approves the deliverables."
  },
  {
    q: "Can I switch between monthly and annual plans?",
    a: "Absolutely! You can upgrade, downgrade, or cancel your subscription at any time directly through your dashboard settings. Upgrading to annual saves you up to 20% of the cost."
  },
  {
    q: "What local payout options are supported in Uganda?",
    a: "We support direct withdrawals to MTN Mobile Money, Airtel Mobile Money, and all major commercial banks in Uganda. Withdrawals are processed instantly upon escrow release."
  },
  {
    q: "Are there any hidden fees or extra charges?",
    a: "None! The prices listed above are flat rates. Free accounts are subject to a standard 10% platform commission on completed gigs, which reduces to 5% for Pro accounts and 0% for Enterprise accounts."
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className={styles.container}>
      {/* Background glowing decorations */}
      <div className={styles.glowTop}></div>
      <div className={styles.glowAccent}></div>

      <div className="container">
        
        {/* Header Block */}
        <div className={styles.header}>
          <span className={styles.badge}>Plans & Subscriptions</span>
          <h1 className={styles.title}>
            Simple, Transparent <span className="text-gradient">Pricing</span>
          </h1>
          <p className={styles.subtitle}>
            Choose the perfect plan to grow your business, showcase your talent, or hire verified Ugandan professionals.
          </p>

          {/* Toggle Switch */}
          <div className={styles.toggleContainer}>
            <span className={billingCycle === "monthly" ? styles.activeCycle : ""}>Monthly</span>
            <button 
              className={styles.toggleBtn}
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              aria-label="Toggle billing cycle"
            >
              <div className={`${styles.toggleCircle} ${billingCycle === "yearly" ? styles.toggleRight : ""}`}></div>
            </button>
            <span className={billingCycle === "yearly" ? styles.activeCycle : ""}>
              Yearly <span className={styles.saveBadge}>Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className={styles.grid}>
          {plans.map((plan) => {
            const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
            
            return (
              <div 
                key={plan.name} 
                className={`${styles.card} ${plan.popular ? styles.popularCard : ""} ${plan.color === "accent" ? styles.accentCard : ""}`}
              >
                {plan.popular && (
                  <div className={styles.popularBadge}>
                    <Sparkles size={14} className="inline mr-1" />
                    Most Popular
                  </div>
                )}

                <div className={styles.cardHeader}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planDesc}>{plan.description}</p>
                  
                  <div className={styles.priceRow}>
                    <span className={styles.currency}>UGX</span>
                    <span className={styles.amount}>{price.toLocaleString()}</span>
                    <span className={styles.period}>/{billingCycle === "monthly" ? "mo" : "mo"}</span>
                  </div>
                  {billingCycle === "yearly" && price > 0 && (
                    <div className={styles.yearlySavings}>
                      Billed annually (UGX {(price * 12).toLocaleString()}/yr)
                    </div>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.divider}></div>
                  <h4 className={styles.featureTitle}>Features Included:</h4>
                  <ul className={styles.featureList}>
                    {plan.features.map((feature, i) => (
                      <li key={i} className={styles.featureItem}>
                        <Check size={16} className={plan.popular ? "text-primary-500" : "text-emerald-500"} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.cardFooter}>
                  <a 
                    href={plan.href} 
                    className={`btn ${plan.popular ? "btn-primary" : "btn-outline"} w-full py-4 text-center h-auto font-bold`}
                    style={{ fontSize: "0.95rem" }}
                  >
                    {plan.cta}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Safe Escrow Banner */}
        <div className={styles.escrowBanner}>
          <div className={styles.escrowIcon}>
            <ShieldCheck size={40} className="text-primary-600" />
          </div>
          <div>
            <h3 className={styles.escrowTitle}>Every Hire Secured with Escrow</h3>
            <p className={styles.escrowDesc}>
              No matter what subscription plan you choose, your financial security is our highest priority. All project funds are securely held in MainHR Escrow until you approve the delivered work.
            </p>
          </div>
        </div>

        {/* FAQs Section */}
        <div className={styles.faqSection}>
          <h2 className={styles.faqHeading}>Frequently Asked Questions</h2>
          <div className={styles.faqGrid}>
            {faqs.map((faq, i) => (
              <div key={i} className={styles.faqItem}>
                <h3 className={styles.faqQuestion}>
                  <HelpCircle size={18} className="text-primary-500 flex-shrink-0" />
                  <span>{faq.q}</span>
                </h3>
                <p className={styles.faqAnswer}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
