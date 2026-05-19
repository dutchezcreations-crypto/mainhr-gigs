"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Star, 
  Clock, 
  MapPin, 
  Briefcase, 
  ArrowRight, 
  ShieldCheck,
  Tag,
  DollarSign
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./GigsAndJobs.module.css";

const MOCK_GIGS = [
  {
    id: "mock-gig-1",
    title: "Professional HR Audit and Compliance Review for Corporate Uganda",
    price: 350000,
    delivery_time: "5 days",
    rating_avg: "4.9",
    rating_count: 14,
    categories: { name: "Human Resources" },
    profiles: { full_name: "Sarah Namubiru", avatar_url: "" },
    images: ["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80"]
  },
  {
    id: "mock-gig-2",
    title: "Custom Web Application Development with Next.js 15 & Tailwind",
    price: 1200000,
    delivery_time: "10 days",
    rating_avg: "5.0",
    rating_count: 28,
    categories: { name: "Software Development" },
    profiles: { full_name: "David Okello", avatar_url: "" },
    images: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"]
  },
  {
    id: "mock-gig-3",
    title: "Premium Social Media Strategy & Brand Management for Startups",
    price: 250000,
    delivery_time: "3 days",
    rating_avg: "4.8",
    rating_count: 19,
    categories: { name: "Digital Marketing" },
    profiles: { full_name: "Fiona Kyomugisha", avatar_url: "" },
    images: ["https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80"]
  },
  {
    id: "mock-gig-4",
    title: "Corporate Financial Model & Pitch Deck for Series A Funding",
    price: 900000,
    delivery_time: "7 days",
    rating_avg: "4.9",
    rating_count: 8,
    categories: { name: "Business & Finance" },
    profiles: { full_name: "John Ssenyonga", avatar_url: "" },
    images: ["https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80"]
  },
  {
    id: "mock-gig-5",
    title: "Sleek Mobile App UI/UX Design System in Figma",
    price: 600000,
    delivery_time: "4 days",
    rating_avg: "5.0",
    rating_count: 15,
    categories: { name: "UI/UX Design" },
    profiles: { full_name: "Martha Atwine", avatar_url: "" },
    images: ["https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80"]
  },
  {
    id: "mock-gig-6",
    title: "SEO Auditing & High-Authority Backlink Building",
    price: 300000,
    delivery_time: "6 days",
    rating_avg: "4.7",
    rating_count: 22,
    categories: { name: "Digital Marketing" },
    profiles: { full_name: "Emmanuel Mukasa", avatar_url: "" },
    images: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"]
  },
  {
    id: "mock-gig-7",
    title: "Professional Translation & Copywriting (English to Luganda/Swahili)",
    price: 150000,
    delivery_time: "2 days",
    rating_avg: "4.9",
    rating_count: 11,
    categories: { name: "Writing & Translation" },
    profiles: { full_name: "Agnes Nabakooza", avatar_url: "" },
    images: ["https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80"]
  },
  {
    id: "mock-gig-8",
    title: "Full-Scale Cybersecurity PenTesting & Vulnerability Report",
    price: 1500000,
    delivery_time: "14 days",
    rating_avg: "5.0",
    rating_count: 7,
    categories: { name: "Software Development" },
    profiles: { full_name: "Robert Mwesigye", avatar_url: "" },
    images: ["https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"]
  }
];

const MOCK_JOBS = [
  {
    id: "mock-job-1",
    title: "Senior HR Consultant / Talent Acquisition Specialist",
    description: "Looking for an experienced HR Professional to audit our staffing workflows and design a scalable onboarding program.",
    budget_min: 800000,
    budget_max: 1500000,
    budget_type: "fixed",
    location_type: "hybrid",
    job_type: "contract",
    profiles: { full_name: "Standard Chartered Uganda" }
  },
  {
    id: "mock-job-2",
    title: "Full-Stack Next.js Developer for Fintech Project",
    description: "We are hiring a freelance software engineer to integrate mobile money payments APIs (MTN/Airtel) into our platform.",
    budget_min: 1500000,
    budget_max: 3000000,
    budget_type: "fixed",
    location_type: "remote",
    job_type: "freelance",
    profiles: { full_name: "Eseza Digital Systems" }
  },
  {
    id: "mock-job-3",
    title: "Social Media Manager & Content Creator",
    description: "Manage content calendar, visual assets, and engagement metrics for a fast-growing restaurant chain in Kampala.",
    budget_min: 400000,
    budget_max: 600000,
    budget_type: "monthly",
    location_type: "onsite",
    job_type: "part-time",
    profiles: { full_name: "Café Javas Uganda" }
  },
  {
    id: "mock-job-4",
    title: "Corporate Legal Advisor & Contract Draftsman",
    description: "Drafting shareholder agreements, employment terms, and NDAs for a newly-incorporated agritech startup in Jinja.",
    budget_min: 500000,
    budget_max: 1000000,
    budget_type: "fixed",
    location_type: "remote",
    job_type: "freelance",
    profiles: { full_name: "Kakira Agri Holdings" }
  },
  {
    id: "mock-job-5",
    title: "Creative Video Editor & Motion Graphics Designer",
    description: "Edit high-impact 30-second promotional commercials for TV and social media campaigns using After Effects.",
    budget_min: 600000,
    budget_max: 900000,
    budget_type: "fixed",
    location_type: "remote",
    job_type: "contract",
    profiles: { full_name: "WaveMedia Production Agency" }
  },
  {
    id: "mock-job-6",
    title: "Senior Product Manager / Project Lead",
    description: "Lead development sprints, client communications, and product delivery schedules for an enterprise SaaS application.",
    budget_min: 2500000,
    budget_max: 4000000,
    budget_type: "monthly",
    location_type: "hybrid",
    job_type: "full-time",
    profiles: { full_name: "MainHR Staffing Labs" }
  },
  {
    id: "mock-job-7",
    title: "Professional Accountant & Tax Compliance Officer",
    description: "Organizing business ledgers, filing URA monthly VAT returns, and advising on tax planning strategies for a manufacturing firm.",
    budget_min: 1000000,
    budget_max: 1800000,
    budget_type: "monthly",
    location_type: "onsite",
    job_type: "full-time",
    profiles: { full_name: "Mukwano Industries Ltd" }
  },
  {
    id: "mock-job-8",
    title: "Customer Success & Lead Generation Agent",
    description: "Outbound communication with prospects, qualifying high-value leads, and booking software demos for B2B solutions.",
    budget_min: 300000,
    budget_max: 500000,
    budget_type: "hourly",
    location_type: "remote",
    job_type: "part-time",
    profiles: { full_name: "DigiConnect Uganda" }
  }
];

export function GigsAndJobs() {
  const supabase = createClient();
  const [gigs, setGigs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch active Services (Gigs)
        const { data: servicesData } = await supabase
          .from("services")
          .select(`
            *,
            categories(name),
            profiles:freelancer_id(full_name, avatar_url)
          `)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(8);

        // Fetch open Jobs
        const { data: jobsData } = await supabase
          .from("jobs")
          .select(`
            *,
            categories(name),
            profiles:employer_id(full_name, avatar_url)
          `)
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(8);

        let mergedGigs = [...(servicesData || [])];
        if (mergedGigs.length < 8) {
          const needed = 8 - mergedGigs.length;
          const mockToAdd = MOCK_GIGS.slice(0, needed);
          mergedGigs = [...mergedGigs, ...mockToAdd];
        }
        setGigs(mergedGigs);

        let mergedJobs = [...(jobsData || [])];
        if (mergedJobs.length < 8) {
          const needed = 8 - mergedJobs.length;
          const mockToAdd = MOCK_JOBS.slice(0, needed);
          mergedJobs = [...mergedJobs, ...mockToAdd];
        }
        setJobs(mergedJobs);
      } catch (err) {
        console.error("Error fetching homepage marketplace entries:", err);
        setGigs(MOCK_GIGS);
        setJobs(MOCK_JOBS);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [supabase]);

  return (
    <section className={styles.section}>
      <div className="container">
        
        {/* Marketplace Section Header */}
        <div className={styles.sectionHeader}>
          <span className={styles.badge}>Live Marketplace</span>
          <h2 className={styles.sectionTitle}>
            Trending <span className="text-gradient">Gigs</span> & High-Paying <span className="text-gradient">Jobs</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Uganda&apos;s premium freelance agency hub. Instantly discover professional services or submit applications for premium corporate work.
          </p>
        </div>

        {/* ================= GIGS MARKETPLACE ================= */}
        <div className={styles.marketplaceGroup}>
          <div className={styles.groupHeader}>
            <div>
              <h3 className={styles.groupTitle}>Trending Freelance Services</h3>
              <p className={styles.groupSubtitle}>Pre-scoped gigs offered by top-rated verified Ugandan specialists</p>
            </div>
            <Link href="/gigs" className={styles.exploreLink}>
              Explore More Gigs <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.grid}>
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "360px", borderRadius: "20px" }}></div>
              ))
            ) : (
              gigs.map((gig) => (
                <Link key={gig.id} href={`/gigs/${gig.id}`} className={styles.gigCard}>
                  <div 
                    className={styles.gigCardBanner}
                    style={
                      gig.images && gig.images.length > 0 && gig.images[0]
                        ? { 
                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.25)), url(${gig.images[0]})`, 
                            backgroundSize: 'cover', 
                            backgroundPosition: 'center',
                            opacity: 1
                          }
                        : {}
                    }
                  >
                    <div className={styles.categoryBadge}>
                      {gig.categories?.name || "Service"}
                    </div>
                  </div>
                  <div className={styles.gigCardBody}>
                    <div className={styles.authorInfo}>
                      {gig.profiles?.avatar_url ? (
                        <div 
                          className={styles.authorAvatar} 
                          style={{ backgroundImage: `url(${gig.profiles.avatar_url})` }}
                        />
                      ) : (
                        <div className={styles.authorAvatarFallback}>
                          {gig.profiles?.full_name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <div className={styles.authorName}>{gig.profiles?.full_name || "Verified Agent"}</div>
                        <div className={styles.authorVerified}>
                          <ShieldCheck size={12} className="inline mr-1 text-emerald-500" />
                          Verified
                        </div>
                      </div>
                    </div>
                    
                    <h4 className={styles.gigCardTitle}>{gig.title}</h4>
                    
                    <div className={styles.ratingRow}>
                      <Star size={14} fill="currentColor" className={styles.starIcon} />
                      <span className={styles.ratingVal}>{gig.rating_avg || "5.0"}</span>
                      <span className={styles.ratingCount}>({gig.rating_count || 0} reviews)</span>
                    </div>
                  </div>

                  <div className={styles.gigCardFooter}>
                    <div className={styles.deliveryInfo}>
                      <Clock size={14} />
                      <span>{gig.delivery_time || "3 days"}</span>
                    </div>
                    <div className={styles.priceInfo}>
                      <span className={styles.priceLabel}>Starting At</span>
                      <span className={styles.priceVal}>UGX {gig.price?.toLocaleString() || "150,000"}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          
          <div className={styles.mobileExploreBtnContainer}>
            <Link href="/gigs" className="btn btn-outline" style={{ width: "100%" }}>
              Explore More Gigs
            </Link>
          </div>
        </div>

        {/* ================= JOBS BOARD ================= */}
        <div className={styles.marketplaceGroup} style={{ marginTop: "var(--space-3xl)" }}>
          <div className={styles.groupHeader}>
            <div>
              <h3 className={styles.groupTitle}>High-Paying Job Openings</h3>
              <p className={styles.groupSubtitle}>Urgent opportunities posted by companies looking for top talent</p>
            </div>
            <Link href="/jobs" className={styles.exploreLink}>
              Explore More Jobs <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.grid}>
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "300px", borderRadius: "20px" }}></div>
              ))
            ) : (
              jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className={styles.jobCard}>
                  <div className={styles.jobCardHeader}>
                    <div className={styles.jobBadges}>
                      <span className={`${styles.badgePill} ${styles.badgeType}`}>
                        {job.job_type || "freelance"}
                      </span>
                      <span className={`${styles.badgePill} ${styles.badgeLoc}`}>
                        {job.location_type || "remote"}
                      </span>
                    </div>
                    <div className={styles.categoryTag}>
                      <Tag size={12} className="inline mr-1" />
                      {job.categories?.name || "Business"}
                    </div>
                  </div>

                  <div className={styles.jobCardBody}>
                    <h4 className={styles.jobCardTitle}>{job.title}</h4>
                    <p className={styles.jobCardDesc}>
                      {job.description?.substring(0, 120)}...
                    </p>
                  </div>

                  <div className={styles.jobCardFooter}>
                    <div className={styles.jobEmployer}>
                      <Briefcase size={14} className="text-neutral-400" />
                      <span>{job.profiles?.full_name || "Verified Client"}</span>
                    </div>
                    <div className={styles.budgetCol}>
                      <DollarSign size={14} className="text-emerald-600" />
                      <span className={styles.budgetVal}>
                        UGX {job.budget_min?.toLocaleString()} {job.budget_max ? `- ${job.budget_max.toLocaleString()}` : ""}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className={styles.mobileExploreBtnContainer}>
            <Link href="/jobs" className="btn btn-outline" style={{ width: "100%" }}>
              Explore More Jobs
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
