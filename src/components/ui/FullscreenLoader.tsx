import React from "react";
import styles from "./FullscreenLoader.module.css";

interface FullscreenLoaderProps {
  message?: string;
}

export function FullscreenLoader({ message }: FullscreenLoaderProps) {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.spinner} aria-label="Loading..." />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
