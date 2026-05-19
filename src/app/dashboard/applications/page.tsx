import { useState, useEffect } from "react";
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Loader2,
  MapPin,
  Building2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./ApplicationsTracking.module.css";
import { Link } from "react-router-dom";

export default function MyApplicationsPage() {
  const supabase = createClient() as any;
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [supabase]);

  const fetchApplications = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data } = await supabase
        .from("applications")
        .select(`
          *,
          jobs (
            title,
            location,
            job_type,
            employer_id,
            profiles:employer_id (full_name)
          )
        `)
        .eq("freelancer_id", user.id)
        .order("created_at", { ascending: false });
      
      if (data) setApplications(data);
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary-600" size={48} />
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Applications</h1>
      </header>

      {applications.length === 0 ? (
        <div className={styles.empty}>
          <Briefcase size={64} className="mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold">No applications yet</h2>
          <p className="mb-8">Start applying for jobs to see your progress here.</p>
          <Link to="/jobs" className="btn btn-primary">Browse Jobs</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {applications.map(app => (
            <div key={app.id} className={styles.card}>
              <div className={styles.info}>
                <h3 className={styles.jobTitle}>{app.jobs?.title}</h3>
                <div className={styles.employer}>
                  <Building2 size={14} className="inline mr-1" /> {app.jobs?.profiles?.full_name}
                  <span className="mx-2">•</span>
                  <MapPin size={14} className="inline mr-1" /> {app.jobs?.location}
                </div>
              </div>

              <div className={styles.bidInfo}>
                <span className={styles.bidLabel}>Your Bid</span>
                <span className={styles.bidValue}>UGX {(app.proposed_rate || app.bid_amount)?.toLocaleString()}</span>
              </div>

              <div className={styles.statusContainer}>
                <span className={`${styles.badge} ${styles[app.status]}`}>
                  {app.status}
                </span>
              </div>

              {app.status === 'hired' || app.status === 'accepted' ? (
                <Link to={`/dashboard/projects/${app.job_id}`} className="btn btn-primary btn-sm">
                  Manage Project <ChevronRight size={16} />
                </Link>
              ) : (
                <Link to={`/jobs/${app.job_id}`} className="btn btn-ghost btn-sm">
                  View Job <ChevronRight size={16} />
                </Link>
              )}
            </div>
          ))}
        </div>

      )}
    </div>
  );
}
