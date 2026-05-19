"use client";

import { useState, useEffect } from "react";
import { 
  Star, 
  Clock, 
  ShieldCheck, 
  MessageSquare, 
  ChevronRight,
  Check,
  Zap,
  Loader2,
  Users,
  Image as ImageIcon,
  ArrowLeft
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/layout/Logo";
import styles from "./GigDetail.module.css";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function GigDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const supabase = createClient();
  
  const [gig, setGig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchGigData();
  }, [id, supabase]);

  const fetchGigData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("services")
      .select(`
        *,
        categories(name),
        profiles:freelancer_id(id, full_name, avatar_url, rating_avg, rating_count)
      `)
      .eq("id", id)
      .single();
    
    if (data) setGig(data);
    setLoading(false);
  };

  const handlePurchase = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }

    if (!confirm(`Are you sure you want to purchase this service for UGX ${gig.price.toLocaleString()}? The funds will be held in escrow.`)) return;

    setPurchasing(true);
    try {
      const { data: projectId, error } = await supabase.rpc('purchase_service', {
        p_service_id: id,
        p_employer_id: user.id,
        p_amount: gig.price
      });

      if (error) throw error;

      alert("Service purchased successfully!");
      router.push(`/dashboard/projects/${projectId}`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary-600" size={48} />
    </div>
  );

  if (!gig) return (
    <div className="container py-20 text-center">
      <h2 className="text-2xl font-bold">Service not found</h2>
      <Link href="/gigs" className="btn btn-primary mt-4">Back to Marketplace</Link>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className="container">
        {/* Back Link & Breadcrumb aligned */}
        <div className={styles.navigationRow}>
          <Link href="/gigs" className={styles.backLink}>
            <ArrowLeft size={16} /> Marketplace
          </Link>
          <nav className={styles.breadcrumb}>
            <span>{gig.categories?.name}</span>
          </nav>
        </div>

        <div className={styles.layout}>
          <main>
            <h1 className={styles.title}>{gig.title}</h1>
            
            <div className={styles.authorRow}>
              <Link href={`/freelancers/${gig.profiles?.id}`} className={styles.avatar}>
                {gig.profiles?.avatar_url ? (
                  <img src={gig.profiles.avatar_url} alt={gig.profiles?.full_name || ""} />
                ) : (
                  <Users size={20} className="text-neutral-400" />
                )}
              </Link>
              <div>
                <Link href={`/freelancers/${gig.profiles?.id}`} className={styles.authorName}>
                  {gig.profiles?.full_name}
                </Link>
                <div className={styles.rating}>
                  <Star size={12} fill="currentColor" className="text-amber-500" />
                  <span>{gig.profiles?.rating_avg?.toFixed(1) || '5.0'}</span>
                  <span className={styles.reviewsCount}>({gig.profiles?.rating_count || 0} reviews)</span>
                </div>
              </div>
            </div>

            {/* Gallery / Cover Image display logic */}
            <div className={styles.imageGallery}>
              {gig.images?.[0] ? (
                <img src={gig.images[0]} alt={gig.title} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <div className={styles.placeholderLogo}>
                    <Logo height={44} showGigs={true} />
                  </div>
                  <div className={styles.placeholderLabel}>Verified Professional Service</div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className={styles.sectionHeading}>About this service</h2>
              <div className={styles.description}>
                {gig.description}
              </div>
            </div>
          </main>

          <aside>
            <div className={styles.sidebar}>
              <div className={styles.purchaseCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.priceLabel}>Fixed Price</div>
                  <div className={styles.price}>UGX {gig.price.toLocaleString()}</div>
                </div>
                
                <div className={styles.cardBody}>
                  <div className={styles.featureList}>
                    <div className={styles.featureItem}>
                      <Clock size={16} className="text-primary-600" /> 
                      <span>{gig.delivery_time} Delivery</span>
                    </div>
                    <div className={styles.featureItem}>
                      <Zap size={16} className="text-primary-600" /> 
                      <span>{gig.revisions} Revisions</span>
                    </div>
                    <div className={styles.featureItem}>
                      <Check size={16} className="text-primary-600" /> 
                      <span>Professional Quality</span>
                    </div>
                    <div className={styles.featureItem}>
                      <ShieldCheck size={16} className="text-primary-600" /> 
                      <span>Escrow Protected</span>
                    </div>
                  </div>

                  <div className={styles.actionBtns}>
                    <button 
                      className="btn btn-primary w-full py-3 h-auto"
                      onClick={handlePurchase}
                      disabled={purchasing}
                      style={{ fontSize: "0.9rem", fontWeight: 700 }}
                    >
                      {purchasing ? <Loader2 className="animate-spin mr-2" /> : <Zap size={16} className="mr-2" />}
                      Order Now (UGX {gig.price.toLocaleString()})
                    </button>
                    <button className="btn btn-ghost w-full py-3">
                      <MessageSquare size={16} className="mr-2" /> Contact Seller
                    </button>
                  </div>

                  <p className={styles.cardGuarantee}>
                    Safe Payment Guarantee
                  </p>
                </div>
              </div>

              <div className={styles.trustBanner}>
                 <h4 className={styles.trustTitle}>
                    <ShieldCheck size={18} /> MainHR Escrow Trust
                 </h4>
                 <p className={styles.trustDesc}>
                    Your funds are held securely in escrow and only released to the specialist when you approve the finished work.
                 </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
