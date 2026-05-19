"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  Star, 
  ArrowRight, 
  Filter,
  Loader2,
  Users,
  DollarSign,
  ChevronRight
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./Discovery.module.css";
import Link from "next/link";

export default function FreelancerDiscoveryPage() {
  const supabase = createClient();
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [query, setQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minRate, setMinRate] = useState<number>(0);
  const [maxRate, setMaxRate] = useState<number>(500000);

  useEffect(() => {
    fetchFreelancers();
  }, [supabase]);

  const fetchFreelancers = async () => {
    setLoading(true);
    let q = supabase
      .from("profiles")
      .select("*")
      .eq("role", "freelancer")
      .order("rating_avg", { ascending: false });

    if (query) {
      q = q.or(`full_name.ilike.%${query}%,headline.ilike.%${query}%,bio.ilike.%${query}%`);
    }

    const { data } = await q;
    if (data) setFreelancers(data);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFreelancers();
  };

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Work with the best <span className="text-gradient">Ugandan Talent</span></h1>
          <p className={styles.subtitle}>Browse through thousands of verified freelancers ready to help you scale your business.</p>
          
          <form className={styles.searchSection} onSubmit={handleSearch}>
            <div className={styles.inputWrapper}>
              <Search size={20} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search by name, skill, or keyword..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Find Talent</button>
          </form>
        </div>
      </header>

      <div className="container">
        <div className={styles.mainLayout}>
          <aside className={styles.sidebar}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Expertise</span>
              <div className={styles.checkboxList}>
                {["UI/UX Design", "Web Development", "Mobile Apps", "Content Writing", "Digital Marketing"].map(skill => (
                  <label key={skill} className={styles.checkboxItem}>
                    <input type="checkbox" />
                    {skill}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Hourly Rate (UGX)</span>
              <input 
                type="range" 
                min="0" 
                max="200000" 
                step="5000"
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between mt-2 text-xs font-bold text-neutral-400">
                <span>0</span>
                <span>200k+</span>
              </div>
            </div>
          </aside>

          <main>
            <div className={styles.freelancerGrid}>
              {loading ? (
                Array(6).fill(0).map((_, i) => <div key={i} className={styles.loadingSkeleton}></div>)
              ) : freelancers.length === 0 ? (
                <div className={styles.empty}>
                   <Users size={48} className="mx-auto mb-4 opacity-20" />
                   <p className="text-xl font-bold">No talent found</p>
                   <p className="text-neutral-500">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                freelancers.map(talent => (
                  <Link key={talent.id} href={`/freelancers/${talent.id}`} className={styles.freelancerCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.avatar}>
                        {talent.avatar_url ? <img src={talent.avatar_url} alt="" /> : <Users size={32} className="text-neutral-300" />}
                      </div>
                      <div className={styles.nameInfo}>
                        <h3 className={styles.name}>{talent.full_name}</h3>
                        <div className={styles.headline}>{talent.headline || 'Top Rated Freelancer'}</div>
                        <div className={styles.rating}>
                          <Star size={14} fill="currentColor" />
                          <span>{talent.rating_avg?.toFixed(1) || '0.0'}</span>
                          <span className={styles.reviewCount}>({talent.rating_count || 0})</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className={styles.bio}>{talent.bio || 'Experienced professional ready to contribute to your projects. specialized in delivering high-quality results on time.'}</p>
                    
                    <div className={styles.skills}>
                      {(talent.skills || ['Creativity', 'Reliability', 'High Quality']).slice(0, 4).map((skill: string) => (
                        <span key={skill} className={styles.skillBadge}>{skill}</span>
                      ))}
                    </div>

                    <div className={styles.cardFooter}>
                      <div className={styles.rate}>
                        UGX {talent.hourly_rate?.toLocaleString() || '45,000'}<span>/hr</span>
                      </div>
                      <div className={styles.viewProfile}>
                        View Profile <ChevronRight size={16} />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
