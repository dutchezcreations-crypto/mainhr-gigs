import styles from "./TrustBar.module.css";

const partners = [
  "CyberVault Foundation",
  "Ngonzi Community",
  "Real Mamas Club",
  "CW-World-UG",
  "Uganda Innovation Hub",
  "Kampala Tech Lab"
];

export function TrustBar() {
  return (
    <div className={styles.wrapper}>
      <div className="container">
        <p className={styles.label}>Trusted by leading organizations across East Africa</p>
        <div className={styles.track}>
          {partners.map((partner, index) => (
            <div key={index} className={styles.partner}>
              <span className={styles.partnerText}>{partner}</span>
            </div>
          ))}
          {/* Duplicate for infinite effect */}
          {partners.map((partner, index) => (
            <div key={`dup-${index}`} className={styles.partner}>
              <span className={styles.partnerText}>{partner}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
