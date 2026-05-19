import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  User, 
  Briefcase, 
  DollarSign,
  MessageSquare,
  AlertCircle,
  Loader2,
  Lock,
  Unlock,
  Star
} from "lucide-react";
import styles from "../ProjectManagement.module.css";
import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";

export default function ProjectManagementPage() {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useNavigate();
  const supabase = createClient() as any;
  
  const [job, setJob] = useState<any>(null);
  const [escrow, setEscrow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProjectData();
  }, [id, supabase]);

  const fetchProjectData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUser(user);

    // Fetch Job with related info
    const { data: jobData } = await supabase
      .from("jobs")
      .select(`
        *,
        profiles:employer_id (full_name, avatar_url),
        applications!inner (
          id,
          status,
          freelancer_id,
          profiles:freelancer_id (full_name, avatar_url)
        )
      `)
      .eq("id", id)
      .single();
    
    if (jobData) {
      setJob(jobData);
      
      // Fetch Escrow Info
      const { data: escrowData } = await supabase
        .from("escrow_holdings")
        .select("*")
        .eq("job_id", id)
        .maybeSingle();
      
      if (escrowData) setEscrow(escrowData);

      // Check if already reviewed
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("id")
        .eq("job_id", id)
        .eq("reviewer_id", user.id)
        .maybeSingle();
      
      if (reviewData) setHasReviewed(true);
    }
    
    setLoading(false);
  };

  const handleReleaseFunds = async () => {
    if (!confirm("Are you sure you want to release the funds? This will mark the project as completed and transfer UGX " + (escrow?.amount?.toLocaleString()) + " to the freelancer.")) {
      return;
    }

    setReleasing(true);
    try {
      const { error } = await supabase.rpc("release_escrow", {
        p_job_id: id,
        p_employer_id: user.id
      });

      if (error) throw error;

      alert("Funds released successfully! The project is now completed.");
      navigate("/dashboard/jobs");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReleasing(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) return;
    setReleasing(true);
    
    try {
      const { error } = await supabase.from("reviews").insert({
        reviewer_id: user.id,
        reviewee_id: hiredApp.freelancer_id,
        job_id: id,
        rating: rating,
        comment: reviewText
      });

      if (error) throw error;
      
      alert("Thank you for your feedback!");
      setHasReviewed(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReleasing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary-600" size={48} />
    </div>
  );

  if (!job) return (
    <div className={styles.container}>
      <div className="text-center py-20">
        <AlertCircle size={64} className="mx-auto mb-4 text-neutral-300" />
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Link to="/dashboard/jobs" className="text-primary-600 font-bold mt-4 inline-block">Back to Dashboard</Link>
      </div>
    </div>
  );

  const isEmployer = user?.id === job.employer_id;
  const hiredApp = job.applications.find((a: any) => a.status === 'accepted' || a.status === 'hired');
  const partner = isEmployer ? hiredApp?.profiles : job.profiles;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/dashboard/jobs" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-4 font-semibold">
          <ArrowLeft size={16} /> Back to My Jobs
        </Link>
        <div className={styles.statusBadge}>{job.status.replace('_', ' ')}</div>
        <h1 className={styles.title}>{job.title}</h1>
      </header>

      {escrow && escrow.status === 'held' && isEmployer && (
        <div className={styles.escrowBanner}>
          <div className={styles.escrowInfo}>
            <h3>Funds in Escrow</h3>
            <div className={styles.escrowAmount}>UGX {escrow.amount.toLocaleString()}</div>
            <p className="text-xs mt-1 opacity-80 font-bold">Funds are safely held until you confirm completion.</p>
          </div>
          <button 
            className={styles.releaseBtn}
            onClick={handleReleaseFunds}
            disabled={releasing}
          >
            {releasing ? <Loader2 className="animate-spin" /> : "Complete & Release Funds"}
          </button>
        </div>
      )}

      {job.status === 'completed' && isEmployer && !hasReviewed && (
        <section className={styles.reviewSection}>
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}><Star size={20} className="text-amber-500" /> Leave a Review</h2>
            <p className="text-sm text-neutral-500 mb-6 font-semibold">How was your experience working with {partner?.full_name}?</p>
            
            <div className="flex flex-col gap-6 max-w-md">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button 
                    key={s}
                    onClick={() => setRating(s)}
                    className={s <= rating ? "text-amber-500" : "text-neutral-200"}
                  >
                    <Star size={32} fill={s <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              
              <textarea 
                className="w-full p-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none font-medium min-h-[120px]"
                placeholder="Share your feedback about the deliverables and collaboration..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />

              <button 
                className="btn btn-primary w-full py-4 text-lg"
                disabled={rating === 0 || !reviewText || releasing}
                onClick={handleSubmitReview}
              >
                Submit Review
              </button>
            </div>
          </div>
        </section>
      )}

      <div className={styles.layout}>
        <div className="flex flex-col gap-8">
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}><ShieldCheck size={20} className="text-primary-600" /> Collaboration Workspace</h2>
            <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-xl border border-neutral-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-neutral-200 rounded-full overflow-hidden">
                  {partner?.avatar_url ? <img src={partner.avatar_url} alt="" /> : <div className="w-full h-full flex items-center justify-center text-neutral-500"><User size={24} /></div>}
                </div>
                <div>
                  <div className="font-bold text-neutral-900">{partner?.full_name || 'Partner'}</div>
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{isEmployer ? 'Freelancer' : 'Employer'}</div>
                </div>
              </div>
              <Link to={`/dashboard/messages?id=${hiredApp?.id}`} className="btn btn-ghost">
                <MessageSquare size={18} className="mr-2" /> Message
              </Link>
            </div>
            
            <div className="mt-8">
              <h3 className="font-bold mb-4">Milestones</h3>
              <div className={styles.timeline}>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineMarker}>
                    <div className={`${styles.dot} ${styles.dotActive}`}></div>
                    <div className={styles.line}></div>
                  </div>
                  <div className={styles.timelineContent}>
                    <h4>Project Started</h4>
                    <p>Hiring completed and funds locked in escrow.</p>
                    <span className="text-xs text-neutral-400">{new Date(escrow?.created_at || job.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className={styles.timelineItem}>
                  <div className={styles.timelineMarker}>
                    <div className={`${styles.dot} ${job.status === 'completed' ? styles.dotActive : ""}`}></div>
                  </div>
                  <div className={styles.timelineContent}>
                    <h4>Project Completion</h4>
                    <p>{job.status === 'completed' ? 'Funds released and project closed.' : 'Awaiting final deliverables and approval.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className={styles.card}>
            <h2 className={styles.sectionTitle}><Clock size={20} className="text-primary-600" /> Project Details</h2>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Contract Type</span>
                <span className={styles.detailValue}><Briefcase size={16} /> {job.job_type || 'Freelance'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Budget</span>
                <span className={styles.detailValue}><DollarSign size={16} /> UGX {job.budget_max.toLocaleString()}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Location</span>
                <span className={styles.detailValue}>{job.location_type}</span>
              </div>
            </div>
          </div>

          <div className={`${styles.card} bg-neutral-900 text-white border-none`}>
            <h2 className="font-extrabold flex items-center gap-2 mb-4">
              <Lock size={18} className="text-primary-400" /> Secure Escrow
            </h2>
            <p className="text-sm opacity-80 leading-relaxed">
              MainHR Gigs Escrow protects both parties. Funds are only released when the employer confirms the work is complete.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
