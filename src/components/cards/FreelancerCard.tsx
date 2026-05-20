import React from "react";
import { Star, CheckCircle, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./FreelancerCard.module.css";

interface FreelancerCardProps {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  startingPrice: number;
  isOnline?: boolean;
  isVerified?: boolean;
}

export function FreelancerCard({
  id,
  name,
  avatar,
  title,
  skills,
  rating,
  reviewCount,
  startingPrice,
  isOnline = false,
  isVerified = false,
}: FreelancerCardProps) {
  const navigate = useNavigate();
  const visibleSkills = skills.slice(0, 3);
  
  // Format price
  const formattedPrice = `UGX ${startingPrice.toLocaleString()}`;
  
  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/freelancers/${id}`);
  };

  return (
    <article 
      className={styles.card}
      onClick={() => navigate(`/freelancers/${id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/freelancers/${id}`);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View profile for ${name}, ${title}`}
    >
      <div className={styles.header}>
        <div className={styles.avatarContainer}>
          {avatar ? (
            <img src={avatar} alt={`${name}'s avatar`} className={styles.avatar} loading="lazy" />
          ) : (
            <div className={styles.avatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} color="#94a3b8" />
            </div>
          )}
          {isOnline && (
            <span className={styles.onlineIndicator} aria-label="Online status" title="Online" />
          )}
        </div>
        
        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h3 className={styles.name} title={name}>{name}</h3>
            {isVerified && (
              <CheckCircle className={styles.verifiedIcon} aria-label="Verified Freelancer" />
            )}
          </div>
          <p className={styles.title}>{title}</p>
        </div>
      </div>

      {visibleSkills.length > 0 && (
        <div className={styles.skillsContainer} aria-label="Top skills">
          {visibleSkills.map((skill, index) => (
            <span key={index} className={styles.skillPill}>{skill}</span>
          ))}
          {skills.length > 3 && (
            <span className={styles.skillPill}>+{skills.length - 3}</span>
          )}
        </div>
      )}

      <div className={styles.statsRow}>
        <div className={styles.rating} aria-label={`Rating: ${rating} out of 5 stars from ${reviewCount} reviews`}>
          <Star className={styles.starIcon} fill="currentColor" />
          <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
          <span className={styles.reviewCount}>({reviewCount})</span>
        </div>
        
        <div className={styles.price}>
          <span className={styles.priceLabel}>From</span>
          <span className={styles.priceValue}>{formattedPrice}</span>
        </div>
      </div>

      <div className={styles.overlay} aria-hidden="true">
        <button 
          className={styles.viewProfileBtn}
          onClick={handleViewProfile}
          tabIndex={-1} // Prevents double focus since the card itself is focusable
        >
          View Profile
        </button>
      </div>
    </article>
  );
}
