import { useState, useEffect, Suspense } from "react";
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  ShieldCheck,
  ChevronDown,
  Loader2
} from "lucide-react";
import styles from "./GigsPage.module.css";
import { Link } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "react-router-dom";

function GigsContent() {
  const [searchParams] = useSearchParams();
  const supabase = createClient() as any;
  const [gigs, setGigs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("id, name").order("name");
      if (data) setCategories([{ id: "All", name: "All" }, ...data]);
    }
    fetchCategories();
  }, [supabase]);

  useEffect(() => {
    fetchGigs();
  }, [activeCategory, query, supabase]);

  const fetchGigs = async () => {
    setLoading(true);
    let q = supabase
      .from("services")
      .select(`
        *,
        categories(name),
        subcategories(name),
        profiles:freelancer_id(full_name, avatar_url, role)
      `)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (activeCategory !== "All") {
      q = q.eq("category_id", activeCategory);
    }
    
    if (query) {
      q = q.ilike("title", `%${query}%`);
    }

    const { data } = await q;
    if (data) setGigs(data);
    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Find the <span className="text-gradient">Right Talent</span> for Your Business</h1>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="What service are you looking for today?" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button className="btn btn-primary" onClick={fetchGigs}>Search</button>
          </div>
          <div className={styles.popularTags}>
            <span>Popular:</span>
            <button className={styles.tagBtn}>UI/UX Design</button>
            <button className={styles.tagBtn}>HR Audit</button>
            <button className={styles.tagBtn}>Next.js</button>
            <button className={styles.tagBtn}>SEO</button>
          </div>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className="container">
          <div className={styles.filterLayout}>
            <div className={styles.categoryTabs}>
              {categories.slice(0, 7).map(cat => (
                <button 
                  key={cat.id} 
                  className={`${styles.catTab} ${activeCategory === cat.id ? styles.catActive : ""}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div className={styles.advancedFilters}>
              <button className={styles.filterDropdown}>
                Budget <ChevronDown size={16} />
              </button>
              <button className={styles.filterDropdown}>
                Delivery Time <ChevronDown size={16} />
              </button>
              <button className={styles.filterBtn}>
                <Filter size={16} /> Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="section">
        <div className="container">
          <div className={styles.resultsCount}>
            {gigs.length} gigs found
          </div>

          <div className={styles.grid}>
            {loading ? (
              Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: '350px', borderRadius: '16px' }}></div>)
            ) : gigs.length === 0 ? (
              <div className="text-center p-20 col-span-full">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-xl font-bold">No services found.</p>
                <p className="text-neutral-500">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              gigs.map(gig => (
                <Link key={gig.id} to={`/gigs/${gig.id}`} className={styles.card}>
                  <div 
                    className={styles.cardImage}
                    style={
                      gig.images && gig.images.length > 0 && gig.images[0]
                        ? { 
                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.25)), url(${gig.images[0]})`, 
                            backgroundSize: 'cover', 
                            backgroundPosition: 'center' 
                          }
                        : {}
                    }
                  >
                     <div className={styles.categoryBadge}>{gig.categories?.name}</div>
                     <div className={styles.saveBtn}><ShieldCheck size={18} /></div>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.authorRow}>
                      {gig.profiles?.avatar_url ? (
                        <div 
                          className={styles.avatar} 
                          style={{ backgroundImage: `url(${gig.profiles.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                      ) : (
                        <div className={`${styles.avatar} flex items-center justify-center bg-neutral-100 text-neutral-600 font-bold text-xs`} style={{ borderRadius: '50%' }}>
                          {gig.profiles?.full_name?.charAt(0) || "U"}
                        </div>
                      )}
                      <div>
                        <span className={styles.authorName}>{gig.profiles?.full_name || "Verified Agent"}</span>
                        <span className={styles.level}>Verified</span>
                      </div>
                    </div>
                    <h3 className={styles.gigTitle}>{gig.title}</h3>
                    <div className={styles.ratingRow}>
                      <Star size={14} fill="currentColor" className={styles.star} />
                      <span className={styles.rating}>{gig.rating_avg || "5.0"}</span>
                      <span className={styles.reviews}>({gig.rating_count || 0})</span>
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.delivery}>
                      <Clock size={14} />
                      <span>{gig.delivery_time}</span>
                    </div>
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Starting at</span>
                      <span className={styles.priceVal}>UGX {gig.price?.toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GigsPage() {
  return (
    <Suspense fallback={<div className="container p-20 text-center">Loading Gigs...</div>}>
      <GigsContent />
    </Suspense>
  );
}
