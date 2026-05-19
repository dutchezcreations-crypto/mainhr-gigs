"use client";

import { useState, useEffect } from "react";
import { 
  Check, 
  X, 
  Eye, 
  Search, 
  Filter,
  MoreVertical,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../Admin.module.css";

export default function AdminJobsPage() {
  const supabase = createClient();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchJobs();
  }, [filter, supabase]);

  const fetchJobs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("jobs")
      .select(`
        *,
        profiles:employer_id (full_name, email),
        categories (name),
        subcategories (name)
      `)
      .eq("admin_status", filter)
      .order("created_at", { ascending: false });
    
    if (data) setJobs(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const { error } = await supabase
      .from("jobs")
      .update({ admin_status: status })
      .eq("id", id);
    
    if (!error) {
      setJobs(jobs.filter(j => j.id !== id));
    } else {
      alert(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Job Moderation</h1>
      </header>

      <div className={styles.tabs}>
        {["pending", "approved", "rejected"].map((t) => (
          <button 
            key={t}
            className={`${styles.tab} ${filter === t ? styles.tabActive : ""}`}
            onClick={() => setFilter(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.empty}>
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : jobs.length === 0 ? (
          <div className={styles.empty}>
            No {filter} jobs found.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job Details</th>
                <th>Employer</th>
                <th>Category</th>
                <th>Posted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <div className={styles.jobTitle}>{job.title}</div>
                    <div className={styles.jobMeta}>UGX {job.budget_max?.toLocaleString()} • {job.job_type}</div>
                  </td>
                  <td>
                    <div className={styles.jobTitle}>{job.profiles?.full_name}</div>
                    <div className={styles.jobMeta}>{job.profiles?.email}</div>
                  </td>
                  <td>
                    <div className={styles.jobTitle}>{job.categories?.name}</div>
                    <div className={styles.jobMeta}>{job.subcategories?.name}</div>
                  </td>
                  <td>
                    <div className={styles.jobMeta}>{new Date(job.created_at).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} title="View Details">
                        <Eye size={16} />
                      </button>
                      {filter !== "approved" && (
                        <button 
                          className={`${styles.actionBtn} ${styles.approveBtn}`} 
                          title="Approve"
                          onClick={() => handleStatusUpdate(job.id, "approved")}
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {filter !== "rejected" && (
                        <button 
                          className={`${styles.actionBtn} ${styles.rejectBtn}`} 
                          title="Reject"
                          onClick={() => handleStatusUpdate(job.id, "rejected")}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
