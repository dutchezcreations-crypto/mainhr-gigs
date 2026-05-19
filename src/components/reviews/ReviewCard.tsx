"use client";

import { Star, User } from "lucide-react";
import styles from "./ReviewCard.module.css";

interface ReviewProps {
  review: {
    rating: number;
    comment: string;
    created_at: string;
    reviewer: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

export default function ReviewCard({ review }: ReviewProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.reviewer}>
          <div className={styles.avatar}>
            {review.reviewer.avatar_url ? (
              <img src={review.reviewer.avatar_url} alt="" />
            ) : (
              <User size={20} className="text-neutral-400" />
            )}
          </div>
          <div>
            <div className={styles.name}>{review.reviewer.full_name}</div>
            <div className={styles.date}>{new Date(review.created_at).toLocaleDateString()}</div>
          </div>
        </div>
        <div className={styles.stars}>
          {Array(5).fill(0).map((_, i) => (
            <Star 
              key={i} 
              size={14} 
              fill={i < review.rating ? "currentColor" : "none"} 
              className={i >= review.rating ? "text-neutral-200" : ""}
            />
          ))}
        </div>
      </div>
      <p className={styles.comment}>"{review.comment}"</p>
    </div>
  );
}
