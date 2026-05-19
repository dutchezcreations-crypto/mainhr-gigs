import { useState, useEffect } from "react";
import { 
  MapPin, 
  Briefcase, 
  Calendar, 
  Building2, 
  Clock, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  X,
  Send
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./JobDetails.module.css";
import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";

export default function JobDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useNavigate();
  const supabase = createClient() as any;
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [proposal, setProposal] = useState("");
  const [bid, setBid] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    fetchJob();
    checkUser();
  }, [id, supabase]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      // Check if already applied
      const { data } = await supabase
        .from("applications")
        .select("id")
        .eq("job_id", id)
        .eq("freelancer_id", user.id)
        .maybeSingle();
      
      if (data) setApplied(true);
    }
  };

  const fetchJob = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("jobs")
      .select(`
        *,
        categories(name),
        subcategories(name),
        profiles:employer_id(full_name, avatar_url, email)
      `)
      .eq("id", id)
      .single();
    
    if (data) {
      setJob(data);
      setBid(data.budget_max?.toString() || "");
    }
    setLoading(false);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate(`/auth/login?next=/jobs/${id}`);
      return;
    }

    setIsApplying(true);
    const { error } = await supabase
      .from("applications")
      .insert({
        job_id: id,
        freelancer_id: currentUser.id,
        cover_letter: proposal,
        proposed_rate: parseFloat(bid),
        status: 'pending'
      });

    if (error) {
      alert(error.message);
    } else {
      setApplied(true);
      setTimeout(() => setShowApplyModal(false), 2000);
    }
    setIsApplying(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary-600" size={48} />
    </div>
  );

  if (!job) return (
    <div className="container p-20 text-center">
      <h2 className="text-2xl font-bold mb-4">Job not found</h2>
      <Link to="/jobs" className="btn btn-primary">Back to Jobs</Link>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className="container">
        <Link to="/jobs" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-8 font-semibold">
          <ArrowLeft size={18} /> Back to Search
        </Link>

        <div className={styles.layout}>
          <main className={styles.main}>
            <div className={styles.card}>
              <div className={styles.header}>
                <h1 className={styles.title}>{job.title}</h1>
                <div className={styles.meta}>
                  <div className={styles.metaItem}>
                    <Building2 size={18} />
                    <span>{job.profiles?.full_name}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <MapPin size={18} />
                    <span>{job.location}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={18} />
                    <span>{job.job_type}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Calendar size={18} />
                    <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className={styles.content}>
                <h2 className={styles.sectionTitle}>Job Description</h2>
                <div className="prose max-w-none whitespace-pre-wrap">
                  {job.description}
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Skills & Requirements</h2>
              <div className="flex flex-wrap gap-2">
                <span className="tag tag-primary">{job.categories?.name}</span>
                {job.subcategories?.name && <span className="tag tag-primary">{job.subcategories?.name}</span>}
                <span className="tag tag-neutral">Experience: {job.experience_level}</span>
              </div>
            </div>
          </main>

          <aside className={styles.sidebar}>
            <div className={`${styles.priceCard} ${styles.sticky}`}>
              <div className={styles.price}>
                UGX {job.budget_max?.toLocaleString()}
              </div>
              <span className={styles.priceLabel}>Estimated Budget</span>
              
              {applied ? (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 font-bold border border-emerald-100">
                  <CheckCircle2 size={24} />
                  Application Sent
                </div>
              ) : (
                <button 
                  className={`btn btn-primary btn-lg ${styles.applyBtn}`}
                  onClick={() => setShowApplyModal(true)}
                >
                  Apply for this Job
                </button>
              )}
              
              <button className="btn btn-ghost w-full">Save for Later</button>
            </div>

            <div className={styles.employerCard}>
              <h3 className="font-bold mb-4">About the Employer</h3>
              <div className={styles.employerHeader}>
                <div className={styles.avatar}></div>
                <div>
                  <div className={styles.employerName}>{job.profiles?.full_name}</div>
                  <div className="text-sm text-neutral-500">Uganda</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Member since</span>
                  <span className="font-semibold">May 2024</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Total Jobs</span>
                  <span className="font-semibold">12</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Application Modal (Slide-over) */}
      {showApplyModal && (
        <div className={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Submit Proposal</h2>
              <button onClick={() => setShowApplyModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <X size={24} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {applied ? (
                <div className={styles.successState}>
                  <CheckCircle2 size={64} className={styles.successIcon} />
                  <h3 className="text-2xl font-bold mb-2">Proposal Sent!</h3>
                  <p className="text-neutral-500">The employer has been notified of your interest.</p>
                </div>
              ) : (
                <form onSubmit={handleApply} className="space-y-6">
                  <div className="input-group">
                    <label className="input-label">Your Bid (UGX)</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        className="input" 
                        value={bid} 
                        onChange={e => setBid(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Cover Letter / Proposal</label>
                    <textarea 
                      className="input" 
                      rows={10} 
                      placeholder="Describe why you are the best fit for this job, your relevant experience, and how you plan to approach the task..."
                      value={proposal}
                      onChange={e => setProposal(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-xl flex gap-3 text-sm text-amber-800 border border-amber-100">
                    <Clock size={18} className="shrink-0" />
                    <p>Usually employers respond within 24-48 hours. Make sure your profile is complete!</p>
                  </div>

                  <div className={styles.modalFooter}>
                    <button type="button" className="btn btn-ghost flex-1" onClick={() => setShowApplyModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary flex-1" disabled={isApplying}>
                      {isApplying ? <Loader2 className="animate-spin" size={18} /> : <>Send Proposal <Send size={18} /></>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
