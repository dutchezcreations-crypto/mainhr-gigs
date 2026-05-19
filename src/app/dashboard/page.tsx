"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Wallet,
  ArrowRight,
  MoreVertical,
  ExternalLink,
  Loader2,
  Bell
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./Overview.module.css";
import ActivityItem from "@/components/dashboard/ActivityItem";
import ProjectSpotlight from "@/components/dashboard/ProjectSpotlight";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardOverview() {
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [userId, setUserId] = useState<string | null>(null);

  // Hook 1: Fetch Profile, Jobs, and Notifications
  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        setProfile(profileData);

        if (profileData?.role === 'employer') {
          const { data: jobs } = await supabase
            .from("jobs")
            .select("*")
            .eq("employer_id", user.id)
            .order('created_at', { ascending: false })
            .limit(3);
          if (jobs) setActiveJobs(jobs);
        } else {
          const { data: apps } = await supabase
            .from("applications")
            .select("*, job:jobs(*)")
            .eq("freelancer_id", user.id)
            .order('created_at', { ascending: false })
            .limit(3);
          if (apps) setActiveJobs(apps.map((a: any) => ({ 
            ...a.job, 
            status: a.status,
            client_name: "External Client" // Placeholder for actual client name
          })));
        }

        // Fetch Notifications
        const { data: notes } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (notes) setNotifications(notes);
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  // Hook 2: Synchronous Real-time Notification Subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user_notes_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const stats = [
    { label: "Wallet Balance", value: `UGX ${(profile?.balance || 0).toLocaleString()}`, icon: <Wallet size={20} />, color: "var(--color-primary-600)", bg: "var(--color-primary-50)" },
    { label: profile?.role === 'employer' ? "Jobs Posted" : "Applications", value: activeJobs.length.toString(), icon: <TrendingUp size={20} />, color: "var(--color-success-600)", bg: "var(--color-success-50)" },
    { label: "Active Contracts", value: profile?.role === 'employer' ? activeJobs.filter(j => j.status === 'in_progress').length.toString() : activeJobs.filter(a => a.status === 'hired' || a.status === 'accepted').length.toString(), icon: <Clock size={20} />, color: "var(--color-accent-600)", bg: "var(--color-accent-50)" },
    { label: "Completion Rate", value: "100%", icon: <CheckCircle2 size={20} />, color: "var(--color-primary-600)", bg: "var(--color-primary-50)" },
  ];


  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!</h1>
          <p className={styles.subtitle}>Here's what's happening with your {profile?.role === 'employer' ? 'hiring' : 'projects'} today.</p>
        </div>
        <Link href={profile?.role === 'employer' ? "/dashboard/jobs/post" : "/gigs"} className="btn btn-primary">
          {profile?.role === 'employer' ? "Post a New Job" : "Find New Work"} <ArrowRight size={18} />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div>
              <p className={styles.statLabel}>{stat.label}</p>
              <h3 className={styles.statValue}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Project Spotlight */}
      <ProjectSpotlight 
        project={activeJobs.find(j => j.status === 'in_progress' || j.status === 'hired')} 
        role={profile?.role}
      />
 
      <div className={styles.mainGrid}>
        {/* Active Projects */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>{profile?.role === 'employer' ? "Your Recent Jobs" : "Recent Applications"}</h2>
            <Link href={profile?.role === 'employer' ? "/dashboard/jobs" : "/dashboard/applications"} className={styles.viewAll}>View all</Link>
          </div>
          <div className={styles.jobList}>
            {activeJobs.map((job) => (
              <div key={job.id} className={styles.jobItem}>
                <div className={styles.jobInfo}>
                  <h4 className={styles.jobTitle}>{job.title}</h4>
                  <p className={styles.jobMeta}>
                    {job.budget_max ? `UGX ${job.budget_max.toLocaleString()}` : 'Negotiable'} • {job.status.replace('_', ' ')}
                  </p>
                </div>
                <div className={styles.actions}>
                  {job.status === 'in_progress' ? (
                    <Link href={`/dashboard/projects/${job.job_id || job.id}`} className={styles.actionBtn}>
                      <ExternalLink size={16} />
                    </Link>
                  ) : (
                    <Link href={`/dashboard/jobs/${job.id}/applicants`} className={styles.actionBtn}>
                      <ExternalLink size={16} />
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {activeJobs.length === 0 && (
              <div className={styles.emptyState}>
                <p>No active {profile?.role === 'employer' ? 'jobs' : 'applications'} yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className="flex items-center gap-2">
               <Bell size={20} className="text-primary-600" />
               <h2 className={styles.cardTitle}>Recent Activity</h2>
            </div>
            <Link href="/dashboard/messages" className={styles.viewAll}>Go to Inbox</Link>
          </div>
          <div className="p-2 space-y-1">
             <AnimatePresence initial={false}>
               {notifications.length === 0 ? (
                 <div className="py-20 text-center">
                    <Bell size={48} className="mx-auto text-neutral-100 mb-4" />
                    <p className="text-neutral-400 font-bold">No new activity</p>
                 </div>
               ) : (
                 notifications.map((note) => (
                   <ActivityItem key={note.id} notification={note} />
                 ))
               )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
