import { useState, useEffect } from "react";
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Mail, 
  MessageSquare,
  ArrowLeft,
  Loader2,
  Trophy,
  Briefcase,
  DollarSign
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./Applicants.module.css";
import { Link } from "react-router-dom";
import { useParams, useNavigate } from "react-router-dom";

export default function JobApplicantsPage() {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useNavigate();
  const supabase = createClient() as any;
  
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchJobAndApplicants();
  }, [id, supabase]);

  const fetchJobAndApplicants = async () => {
    setLoading(true);
    
    // Fetch Job Details
    const { data: jobData } = await supabase
      .from("jobs")
      .select("title, budget_max")
      .eq("id", id)
      .single();
    
    if (jobData) setJob(jobData);

    // Fetch Applicants
    const { data: applicantsData } = await supabase
      .from("applications")
      .select(`
        *,
        profiles:freelancer_id (
          id,
          full_name,
          avatar_url,
          email,
          role
        )
      `)
      .eq("job_id", id)
      .order("created_at", { ascending: false });
    
    if (applicantsData) {
      setApplicants(applicantsData);
      if (applicantsData.length > 0) setSelectedApplicant(applicantsData[0]);
    }
    
    setLoading(false);
  };

  const handleStatusUpdate = async (appId: string, newStatus: string) => {
    setUpdating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (newStatus === "hired") {
        const app = applicants.find(a => a.id === appId);
        const budget = job?.budget_max || 0;

        const { error: hireError } = await supabase.rpc("hire_freelancer", {
          p_job_id: id,
          p_application_id: appId,
          p_employer_id: user.id,
          p_freelancer_id: app.freelancer_id,
          p_amount: budget
        });

        if (hireError) throw hireError;
      } else {
        // Update application status for other statuses (shortlisted, rejected, etc)
        const { error } = await supabase
          .from("applications")
          .update({ status: newStatus })
          .eq("id", appId);

        if (error) throw error;
      }
      
      setApplicants(prev => prev.map(app => 
        app.id === appId ? { ...app, status: newStatus } : app
      ));
      if (selectedApplicant?.id === appId) {
        setSelectedApplicant((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleMessage = async (freelancerId: string, applicationId: string) => {
    setUpdating(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if conversation already exists for this application
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("application_id", applicationId)
      .maybeSingle();

    if (existing) {
      navigate(`/dashboard/messages?id=${existing.id}`);
    } else {
      // Create new conversation
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          participant_one: user.id,
          participant_two: freelancerId,
          job_id: id,
          application_id: applicationId
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
      } else {
        navigate(`/dashboard/messages?id=${newConv.id}`);
      }
    }
    setUpdating(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary-600" size={48} />
    </div>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link to="/dashboard/jobs" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 mb-4 font-semibold">
          <ArrowLeft size={16} /> Back to My Jobs
        </Link>
        <h1 className={styles.title}>Review Applicants</h1>
        <div className={styles.jobTitle}>{job?.title} • UGX {job?.budget_max?.toLocaleString()}</div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Applicants</span>
          <div className={styles.statValue}>{applicants.length}</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Shortlisted</span>
          <div className={styles.statValue}>{applicants.filter(a => a.status === 'shortlisted').length}</div>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Hired</span>
          <div className={styles.statValue}>{applicants.filter(a => a.status === 'hired').length}</div>
        </div>
      </div>

      {applicants.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={64} className="mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold">No applications yet</h2>
          <p>Your job post is live. Applicants will appear here once they submit proposals.</p>
        </div>
      ) : (
        <div className={styles.applicantGrid}>
          <aside className={styles.sidebar}>
            {applicants.map(app => (
              <div 
                key={app.id} 
                className={`${styles.applicantCard} ${selectedApplicant?.id === app.id ? styles.activeApplicant : ""}`}
                onClick={() => setSelectedApplicant(app)}
              >
                <div className={styles.applicantHeader}>
                  <div className={styles.avatar}></div>
                  <div>
                    <div className={styles.name}>{app.profiles?.full_name}</div>
                    <div className={styles.bid}>Bid: UGX {(app.proposed_rate || app.bid_amount)?.toLocaleString()}</div>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${styles[`status-${app.status}`]}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </aside>

          {selectedApplicant && (
            <main className={styles.detailView}>
              <div className={styles.detailHeader}>
                <div>
                  <h2 className={styles.detailName}>{selectedApplicant.profiles?.full_name}</h2>
                  <div className={styles.detailTitle}>Professional Freelancer</div>
                </div>
                <div className={styles.actions}>
                  {selectedApplicant.status !== 'hired' && (
                    <>
                      <button 
                        className="btn btn-ghost" 
                        disabled={updating}
                        onClick={() => handleStatusUpdate(selectedApplicant.id, selectedApplicant.status === 'shortlisted' ? 'pending' : 'shortlisted')}
                      >
                        {selectedApplicant.status === 'shortlisted' ? 'Remove Shortlist' : 'Shortlist'}
                      </button>
                      <button 
                        className="btn btn-primary" 
                        disabled={updating}
                        onClick={() => handleStatusUpdate(selectedApplicant.id, 'hired')}
                      >
                        Hire Freelancer
                      </button>
                    </>
                  )}
                  {selectedApplicant.status === 'hired' && (
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
                      <Trophy size={18} /> Hired
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-8 mb-8">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Bid Amount</span>
                  <span className="text-lg font-extrabold text-primary-600">UGX {(selectedApplicant.proposed_rate || selectedApplicant.bid_amount)?.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Applied On</span>
                  <span className="text-lg font-bold">{new Date(selectedApplicant.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Rating</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={16} fill="currentColor" />
                    <span className="text-lg font-bold">4.9</span>
                  </div>
                </div>
              </div>

              <h3 className="font-bold mb-4">Proposal Text</h3>
              <div className={styles.proposalBox}>
                {selectedApplicant.cover_letter || selectedApplicant.proposal_text}
              </div>

              <div className="flex gap-4">
                <button 
                  className="btn btn-ghost flex-1"
                  disabled={updating}
                  onClick={() => handleMessage(selectedApplicant.freelancer_id, selectedApplicant.id)}
                >
                  <MessageSquare size={18} className="mr-2" /> Message
                </button>
                <button className="btn btn-ghost flex-1">
                  <Mail size={18} className="mr-2" /> View Email
                </button>
              </div>
            </main>
          )}
        </div>
      )}
    </div>
  );
}
