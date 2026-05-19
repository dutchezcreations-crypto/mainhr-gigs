import styles from "./StatsSection.module.css";

const stats = [
  { value: "15k+", label: "Verified Freelancers", suffix: "active" },
  { value: "2.4k+", label: "Companies Registered", suffix: "partners" },
  { value: "UGX 4.5B", label: "Paid to Talent", suffix: "annually" },
  { value: "4.9/5", label: "Average Rating", suffix: "platform-wide" },
];

export function StatsSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.value}>{stat.value}</div>
              <div className={styles.label}>{stat.label}</div>
              <div className={styles.suffix}>{stat.suffix}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
