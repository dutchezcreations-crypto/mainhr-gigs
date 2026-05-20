import React from "react";
import styles from "./TrustStatsBar.module.css";

export function TrustStatsBar() {
  const stats = [
    { value: "12,000", suffix: "+", label: "Freelancers" },
    { value: "98", suffix: "%", label: "Client Satisfaction" },
    { value: "UGX 0", suffix: "", label: "Platform Fee for First Job" },
    { value: "24/7", suffix: "", label: "Support" },
  ];

  return (
    <section className={styles.container}>
      <div className={styles.grid}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statBlock}>
            <div className={styles.statValue}>
              {stat.value}<span>{stat.suffix}</span>
            </div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
