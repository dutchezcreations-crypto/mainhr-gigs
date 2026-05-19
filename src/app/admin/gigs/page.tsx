"use client";

import { useState, useEffect } from "react";
import { 
  Check, 
  X, 
  Eye, 
  Loader2,
  ExternalLink
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../Admin.module.css";
import Link from "next/link";

export default function AdminGigsPage() {
  const supabase = createClient();
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active"); // In gigs, 'active' is the default published status

  useEffect(() => {
    fetchGigs();
  }, [filter, supabase]);

  const fetchGigs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("services")
      .select(`
        *,
        profiles:freelancer_id (full_name, email),
        categories (name)
      `)
      .eq("status", filter)
      .order("created_at", { ascending: false });
    
    if (data) setGigs(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    const { error } = await supabase
      .from("services")
      .update({ status: status })
      .eq("id", id);
    
    if (!error) {
      setGigs(gigs.filter(g => g.id !== id));
    } else {
      alert(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Gig Moderation</h1>
      </header>

      <div className={styles.tabs}>
        {["active", "draft", "paused"].map((t) => (
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
        ) : gigs.length === 0 ? (
          <div className={styles.empty}>
            No {filter} gigs found.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Service Details</th>
                <th>Freelancer</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {gigs.map((gig) => (
                <tr key={gig.id}>
                  <td>
                    <div className={styles.jobTitle}>{gig.title}</div>
                    <div className={styles.jobMeta}>{gig.delivery_time} Delivery</div>
                  </td>
                  <td>
                    <div className={styles.jobTitle}>{gig.profiles?.full_name}</div>
                    <div className={styles.jobMeta}>{gig.profiles?.email}</div>
                  </td>
                  <td>
                    <div className={styles.jobTitle}>{gig.categories?.name}</div>
                  </td>
                  <td>
                    <div className={styles.jobTitle}>UGX {gig.price?.toLocaleString()}</div>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/gigs/${gig.id}`} target="_blank" className={styles.actionBtn}>
                        <ExternalLink size={16} />
                      </Link>
                      {filter !== "active" && (
                        <button 
                          className={`${styles.actionBtn} ${styles.approveBtn}`} 
                          onClick={() => handleStatusUpdate(gig.id, "active")}
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {filter !== "paused" && (
                        <button 
                          className={`${styles.actionBtn} ${styles.rejectBtn}`} 
                          onClick={() => handleStatusUpdate(gig.id, "paused")}
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
