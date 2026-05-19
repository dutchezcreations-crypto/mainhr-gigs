import { useState, useEffect } from "react";
import { 
  Users, 
  MapPin, 
  Star, 
  Clock, 
  Globe, 
  Mail, 
  MessageSquare,
  ShieldCheck,
  Briefcase,
  Trophy,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Image as ImageIcon
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./Profile.module.css";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import ReviewCard from "@/components/reviews/ReviewCard";

export default function FreelancerProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const navigate = useNavigate();
  const supabase = createClient() as any;
  
  const [profile, setProfile] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchProfileData();
  }, [id, supabase]);

  const fetchProfileData = async () => {
    setLoading(true);
    
    // Fetch Profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    
    if (profileData) setProfile(profileData);

    // Fetch Reviews
    const { data: reviewsData } = await supabase
      .from("reviews")
      .select(`
        *,
        reviewer:reviewer_id(full_name, avatar_url)
      `)
      .eq("reviewee_id", id)
      .order("created_at", { ascending: false });
    
    if (reviewsData) setReviews(reviewsData);
    
    // Fetch Portfolio
    const { data: portfolioData } = await supabase
      .from("portfolios")
      .select("*")
      .eq("freelancer_id", id)
      .order("created_at", { ascending: false });
    
    if (portfolioData) setPortfolio(portfolioData);

    setLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary-600" size={48} />
    </div>
  );

  if (!profile) return (
    <div className="container py-20 text-center">
      <h2 className="text-2xl font-bold">Freelancer not found</h2>
      <Link to="/freelancers" className="btn btn-primary mt-4">Back to Discovery</Link>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className="container">
        <header className={styles.profileHeader}>
          <div className={styles.headerContent}>
            <div className={styles.avatar}>
              {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <Users size={64} className="text-neutral-300" />}
            </div>
            <div className={styles.mainInfo}>
              <div className={styles.nameRow}>
                <h1 className={styles.name}>{profile.full_name}</h1>
                <span className={styles.badge}><ShieldCheck size={14} className="inline mr-1" /> Verified Expert</span>
              </div>
              <p className={styles.headline}>{profile.headline || 'Professional Freelancer'}</p>
              
              <div className={styles.metaGrid}>
                <div className={styles.metaItem}><MapPin size={18} /> {profile.location || 'Kampala, Uganda'}</div>
                <div className={styles.metaItem}><Star size={18} className="text-amber-500" fill="currentColor" /> <strong>{profile.rating_avg?.toFixed(1) || '0.0'}</strong> ({profile.rating_count || 0} reviews)</div>
                <div className={styles.metaItem}><Globe size={18} /> Speaks English, Luganda</div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.layout}>
          <div className="flex flex-col gap-8">
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}><Users size={20} className="text-primary-600" /> About Me</h2>
              <div className={styles.bio}>
                {profile.bio || "No biography provided. This freelancer is ready to take on new challenges and deliver exceptional results for your business."}
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}><Trophy size={20} className="text-primary-600" /> Skills & Expertise</h2>
              <div className={styles.skillsGrid}>
                {(profile.skills || ['Communication', 'Dedication', 'Problem Solving']).map((skill: string) => (
                  <span key={skill} className={styles.skillBadge}>{skill}</span>
                ))}
              </div>
            </section>

            {portfolio.length > 0 && (
              <section className={styles.card}>
                <h2 className={styles.sectionTitle}><Briefcase size={20} className="text-primary-600" /> Portfolio Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  {portfolio.map((item) => (
                    <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-neutral-100 bg-white transition-all hover:shadow-xl">
                      <div className="aspect-[4/3] bg-neutral-50 overflow-hidden">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-200"><ImageIcon size={48} /></div>
                        )}
                      </div>
                      <div className="p-5">
                        <h4 className="font-850 text-neutral-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-neutral-500 font-medium line-clamp-2 mb-4">{item.description}</p>
                        {item.external_link && (
                          <a href={item.external_link} target="_blank" className="inline-flex items-center gap-2 text-xs font-900 text-primary-600 hover:underline">
                            View Project <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}><Star size={20} className="text-primary-600" /> Client Reviews</h2>
              <div className="flex flex-col gap-6">
                {reviews.length === 0 ? (
                  <p className="text-neutral-500 italic">No reviews yet. Be the first to work with {profile.full_name.split(' ')[0]}!</p>
                ) : (
                  reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                  ))
                )}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-8">
            <div className={`${styles.card} ${styles.sidebarCard}`}>
              <div className={styles.priceBlock}>
                <div className={styles.priceValue}>UGX {profile.hourly_rate?.toLocaleString() || '45,000'}<span>/hr</span></div>
                <p className="text-xs font-bold text-neutral-400 mt-1 uppercase tracking-wider">Starting Rate</p>
              </div>

              <div className={styles.actionBtns}>
                <button className="btn btn-primary btn-lg w-full">Hire {profile.full_name.split(' ')[0]}</button>
                <button className="btn btn-ghost btn-lg w-full"><MessageSquare size={18} className="mr-2" /> Send Message</button>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3 text-sm font-semibold text-neutral-600">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                  98% Job Success Score
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-neutral-600">
                  <Briefcase size={18} className="text-emerald-500" />
                  42 Projects Completed
                </div>
                <div className="flex items-center gap-3 text-sm font-semibold text-neutral-600">
                  <Clock size={18} className="text-emerald-500" />
                  24h Avg. Response Time
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
