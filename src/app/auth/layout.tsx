import { Link, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import styles from "./AuthLayout.module.css";

export default function AuthLayout() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.visual}>
        <div className={styles.visualContent}>
          <Link to="/" className={styles.logo}>
            <Logo height={38} />
          </Link>
          <div className={styles.quote}>
            <blockquote>
              "Building the future of work in Uganda, one connection at a time."
            </blockquote>
            <cite>— The MainHR Team</cite>
          </div>
        </div>
        <div className={styles.pattern}></div>
      </div>
      
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to home
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
