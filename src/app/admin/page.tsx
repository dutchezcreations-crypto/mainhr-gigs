"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Briefcase, 
  Star, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./Admin.module.css";
import Link from "next/link";
import AnalyticsChart from "@/components/analytics/AnalyticsChart";

export default function AdminOverviewPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<any>({
    users: 0,
    jobs: 0,
    gigs: 0,
    pendingJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
      const { count: jobsCount } = await supabase.from("jobs").select("*", { count: "exact", head: true });
      const { count: gigsCount } = await supabase.from("services").select("*", { count: "exact", head: true });
      const { count: pendingJobsCount } = await supabase.from("jobs").select("*", { count: "exact", head: true }).eq("admin_status", "pending");

      setStats({
        users: usersCount || 0,
        jobs: jobsCount || 0,
        gigs: gigsCount || 0,
        pendingJobs: pendingJobsCount || 0
      });
      setLoading(false);
    }
    fetchStats();
  }, [supabase]);

  const cards = [
    { label: "Total Users", value: stats.users, icon: <Users size={24} />, color: "var(--color-primary-600)", bg: "var(--color-primary-50)" },
    { label: "Active Jobs", value: stats.jobs, icon: <Briefcase size={24} />, color: "var(--color-success-600)", bg: "var(--color-success-50)" },
    { label: "Total Gigs", value: stats.gigs, icon: <Star size={24} />, color: "var(--color-accent-600)", bg: "var(--color-accent-50)" },
    { label: "Revenue Share", value: "UGX 0", icon: <TrendingUp size={24} />, color: "var(--color-amber-600)", bg: "var(--color-amber-50)" },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Admin Overview</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl border border-neutral-100 flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-2xl font-900 text-neutral-900">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={styles.tableCard}>
          <div className="p-6 border-bottom flex justify-between items-center">
            <h2 className="text-lg font-850">Platform Growth</h2>
            <div className="text-xs font-bold text-success-600 uppercase tracking-widest">+24% This Month</div>
          </div>
          <div className="p-6">
             <AnalyticsChart 
               data={[
                 { label: "Mon", value: 12 },
                 { label: "Tue", value: 45 },
                 { label: "Wed", value: 32 },
                 { label: "Thu", value: 89 },
                 { label: "Fri", value: 65 },
                 { label: "Sat", value: 110 },
                 { label: "Sun", value: 95 },
               ]}
               height={200}
               color="var(--color-primary-600)"
             />
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className="p-6 border-bottom flex justify-between items-center">
            <h2 className="text-lg font-850">Pending Actions</h2>
            <div className="badge badge-error">{stats.pendingJobs} Action Required</div>
          </div>
          <div className="p-6 space-y-4">
             {stats.pendingJobs > 0 && (
               <Link href="/admin/jobs" className="flex items-center justify-between p-4 bg-error-50 border border-error-100 rounded-xl group transition-all hover:bg-error-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center text-error-600">
                      <Clock size={20} />
                    </div>
                    <div>
                      <div className="font-800 text-error-900">{stats.pendingJobs} Jobs Pending Approval</div>
                      <p className="text-xs font-bold text-error-600 uppercase">Review required for safety</p>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-error-400 group-hover:translate-x-1 transition-transform" />
               </Link>
             )}

             <Link href="/admin/users" className="flex items-center justify-between p-4 bg-primary-50 border border-primary-100 rounded-xl group transition-all hover:bg-primary-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="font-800 text-primary-900">User Verification Queue</div>
                    <p className="text-xs font-bold text-primary-600 uppercase">Build platform trust</p>
                  </div>
                </div>
                <ArrowRight size={20} className="text-primary-400 group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>
        </div>

        <div className={styles.tableCard}>
           <div className="p-6 border-bottom">
              <h2 className="text-lg font-850">Recent Platform Activity</h2>
           </div>
           <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                 <div>
                    <p className="text-sm font-bold text-neutral-900">New freelancer registered</p>
                    <p className="text-xs font-medium text-neutral-400">2 minutes ago</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                 <div>
                    <p className="text-sm font-bold text-neutral-900">Project "HR Audit" completed</p>
                    <p className="text-xs font-medium text-neutral-400">1 hour ago</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                 <div>
                    <p className="text-sm font-bold text-neutral-900">New gig listed in "Graphic Design"</p>
                    <p className="text-xs font-medium text-neutral-400">3 hours ago</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
