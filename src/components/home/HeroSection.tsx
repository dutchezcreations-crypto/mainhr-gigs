import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search } from "lucide-react";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/gigs?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const popularTags = ["Logo Design", "Web Development", "Video Editing", "Copywriting"];

  return (
    <section className={styles.heroContainer}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>
          Find World-Class Talent.
          <span className={styles.titleAccent}>Built for Serious Work.</span>
        </h1>
        
        <p className={styles.subtitle}>
          Connect with elite professionals and agencies for your most important projects. Secure payments, guaranteed quality.
        </p>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchIconWrapper}>
            <Search color="#94a3b8" />
          </div>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for a skill or service..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className={styles.searchBtn}>
            Search
          </button>
        </form>

        <div className={styles.popularTagsRow}>
          <span className={styles.popularLabel}>Popular:</span>
          {popularTags.map((tag) => (
            <button 
              key={tag} 
              className={styles.tagPill}
              onClick={() => navigate(`/gigs?category=${encodeURIComponent(tag)}`)}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className={styles.ctaRow}>
          <Link to="/freelancers" className={styles.btnBrowse}>
            Browse Freelancers
          </Link>
          <Link to="/dashboard/jobs/post" className={styles.btnPost}>
            Post a Job
          </Link>
        </div>
      </div>
    </section>
  );
}
