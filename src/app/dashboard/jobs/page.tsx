import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink,
  ChevronRight,
  Briefcase,
  Users,
  Loader2,
  Calendar,
  Clock,
  CheckCircle2
} from "lucide-react";
import styles from "./Jobs.module.css";
import { Link } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";

export default function JobsPage() {
  const supabase = createClient() as any;
  const [activeTab, setActiveTab] = useState("all");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [supabase]);

  const fetchJobs = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("jobs")
      .select(`
        *,
        applications (id)
      `)
      .eq("employer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "open" && job.status === "open") ||
      (activeTab === "in_progress" && job.status === "in_progress") ||
      (activeTab === "completed" && job.status === "completed") ||
      (activeTab === "draft" && job.status === "draft");
    
    return matchesSearch && matchesTab;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-primary-600" size={48} />
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Manage Jobs</h1>
          <p className={styles.subtitle}>Track your job postings and applications in one place</p>
        </div>
        <Link to="/dashboard/jobs/post" className="btn btn-primary">
          <Plus size={18} /> Post a Job
        </Link>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === "all" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Jobs
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "open" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("open")}
        >
          Open
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "in_progress" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("in_progress")}
        >
          In Progress
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "completed" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.search}>
          <Search size={18} className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Filter jobs by title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Posted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    <Briefcase size={48} className="mx-auto mb-4 opacity-10" />
                    <p>No jobs found in this category.</p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <div className={styles.jobInfo}>
                        <span className={styles.jobTitle}>{job.title}</span>
                        <span className={styles.jobMeta}>{job.job_type || 'Freelance'} • {job.location_type}</span>
                      </div>
                    </td>
                    <td>
                      <Link to={`/dashboard/jobs/${job.id}/applicants`} className={styles.apps}>
                        <Users size={16} />
                        <span>{job.applications?.length || 0} applicants</span>
                      </Link>
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[`status${job.status}`]}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={styles.date}>{new Date(job.created_at).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {job.status === 'in_progress' ? (
                          <Link to={`/dashboard/projects/${job.id}`} className={styles.actionBtn} title="Manage Project">
                            <ExternalLink size={16} />
                          </Link>
                        ) : (
                          <Link to={`/jobs/${job.id}`} className={styles.actionBtn} title="View Post">
                            <ExternalLink size={16} />
                          </Link>
                        )}
                        <button className={styles.actionBtn}><MoreVertical size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
