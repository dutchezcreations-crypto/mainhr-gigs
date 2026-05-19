import { useState, useEffect } from "react";
import { 
  Plus, 
  MoreVertical, 
  Star, 
  Eye, 
  ShoppingBag, 
  Edit2, 
  Trash2, 
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./ManageGigs.module.css";
import { Link } from "react-router-dom";

export default function ManageGigsPage() {
  const supabase = createClient() as any;
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGigs();
  }, [supabase]);

  const fetchGigs = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("services")
      .select(`
        *,
        categories(name)
      `)
      .eq("freelancer_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setGigs(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gig?")) return;
    
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (!error) {
      setGigs(prev => prev.filter(g => g.id !== id));
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Services</h1>
        <Link to="/dashboard/gigs/new" className="btn btn-primary">
          <Plus size={18} className="mr-2" /> Create New Gig
        </Link>
      </header>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-primary-600" size={40} />
        </div>
      ) : gigs.length === 0 ? (
        <div className={styles.empty}>
          <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
          <h2 className="text-xl font-bold">No services listed yet</h2>
          <p className="text-neutral-500 mb-6">Create your first gig to start attracting clients!</p>
          <Link to="/dashboard/gigs/new" className="btn btn-primary">Get Started</Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {gigs.map(gig => (
            <div key={gig.id} className={styles.card}>
              <div className={styles.imagePlaceholder}>
                {gig.images?.[0] ? (
                  <img src={gig.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={40} />
                )}
                <span className={`${styles.statusBadge} ${gig.status === 'active' ? styles.statusActive : styles.statusDraft}`}>
                  {gig.status}
                </span>
              </div>
              
              <div className={styles.content}>
                <div className={styles.category}>{gig.categories?.name}</div>
                <h3 className={styles.gigTitle}>{gig.title}</h3>
                
                <div className={styles.stats}>
                  <div className={styles.statItem} title="Total Orders">
                    <ShoppingBag size={14} /> {gig.orders_count || 0}
                  </div>
                  <div className={styles.statItem} title="Rating">
                    <Star size={14} className="text-amber-500" fill="currentColor" /> 
                    {gig.rating_avg?.toFixed(1) || '5.0'}
                  </div>
                  <div className={styles.statItem} title="Views">
                    <Eye size={14} /> 1.2k
                  </div>
                </div>
              </div>

              <div className={styles.footer}>
                <div className={styles.price}>
                  <span>From</span> UGX {gig.price?.toLocaleString()}
                </div>
                <div className={styles.actions}>
                  <Link to={`/dashboard/gigs/${gig.id}/edit`} className={styles.actionBtn}>
                    <Edit2 size={16} />
                  </Link>
                  <button className={styles.actionBtn} onClick={() => handleDelete(gig.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
