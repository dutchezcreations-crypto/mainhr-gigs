import React from "react";
import { Star, Clock, User, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./GigCard.module.css";

interface GigCardProps {
  id: string;
  title: string;
  thumbnail?: string;
  sellerName: string;
  sellerAvatar?: string;
  rating: number;
  reviewCount: number;
  price: number;
  category: string;
  deliveryDays: number;
}

export function GigCard({
  id,
  title,
  thumbnail,
  sellerName,
  sellerAvatar,
  rating,
  reviewCount,
  price,
  category,
  deliveryDays,
}: GigCardProps) {
  const navigate = useNavigate();
  
  // Format price
  const formattedPrice = `UGX ${price.toLocaleString()}`;

  const handleNavigation = () => {
    navigate(`/gigs/${id}`);
  };

  return (
    <article 
      className={styles.card}
      onClick={handleNavigation}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNavigation();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View gig: ${title} by ${sellerName}`}
    >
      <div className={styles.thumbnailContainer}>
        {thumbnail ? (
          <img src={thumbnail} alt={`Thumbnail for ${title}`} className={styles.thumbnail} loading="lazy" />
        ) : (
          <div className={styles.thumbnail} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b' }}>
            <ImageIcon size={48} color="#475569" />
          </div>
        )}
        <span className={styles.categoryBadge}>{category}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.sellerRow}>
          {sellerAvatar ? (
            <img src={sellerAvatar} alt={`${sellerName}'s avatar`} className={styles.sellerAvatar} loading="lazy" />
          ) : (
            <div className={styles.sellerAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={14} color="#94a3b8" />
            </div>
          )}
          <span className={styles.sellerName}>{sellerName}</span>
        </div>

        <h3 className={styles.title} title={title}>{title}</h3>

        <div className={styles.statsRow} aria-label={`Rating: ${rating} out of 5 stars from ${reviewCount} reviews`}>
          <Star className={styles.starIcon} fill="currentColor" />
          <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
          <span className={styles.reviewCount}>({reviewCount})</span>
        </div>

        <div className={styles.footer}>
          <div className={styles.deliveryRow}>
            <Clock className={styles.clockIcon} />
            <span>Delivered in {deliveryDays} day{deliveryDays !== 1 ? 's' : ''}</span>
          </div>
          <span className={styles.price}>{formattedPrice}</span>
        </div>
      </div>
    </article>
  );
}
