import { useState, useEffect } from "react";
import { 
  Search, 
  ChevronDown, 
  ArrowRight,
  Code,
  Leaf,
  Dog,
  Briefcase,
  Sparkles,
  Headphones,
  Video,
  GraduationCap,
  Settings,
  Landmark,
  HeartPulse,
  Palmtree,
  Users,
  Crown,
  Megaphone,
  Truck,
  ShoppingCart
} from "lucide-react";
import { Link } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import styles from "./CategoriesPage.module.css";

const iconMap: Record<string, any> = {
  'leaf': <Leaf size={24} />,
  'dog': <Dog size={24} />,
  'briefcase': <Briefcase size={24} />,
  'sparkles': <Sparkles size={24} />,
  'headphones': <Headphones size={24} />,
  'video': <Video size={24} />,
  'graduation-cap': <GraduationCap size={24} />,
  'settings': <Settings size={24} />,
  'landmark': <Landmark size={24} />,
  'heart-pulse': <HeartPulse size={24} />,
  'palmtree': <Palmtree size={24} />,
  'users': <Users size={24} />,
  'code': <Code size={24} />,
  'crown': <Crown size={24} />,
  'megaphone': <Megaphone size={24} />,
  'truck': <Truck size={24} />,
  'shopping-cart': <ShoppingCart size={24} />
};

export default function CategoriesPage() {
  const supabase = createClient() as any;
  const [categories, setCategories] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select(`
          *,
          subcategories (
            id,
            name,
            slug
          )
        `)
        .order("name");

      if (data) {
        setCategories(data);
      }
      setLoading(false);
    }
    fetchCategories();
  }, [supabase]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.subcategories?.some((sub: any) => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className="container">
          <h1 className={styles.title}>Browse by <span className="text-gradient">Category</span></h1>
          <p className={styles.subtitle}>
            Explore thousands of professional services across various industries in Uganda.
          </p>
          
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search for categories or skills..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="container">
        <div className={styles.grid}>
          {loading ? (
            Array(9).fill(0).map((_, i) => (
              <div key={i} className={`${styles.card} ${styles.skeleton}`} style={{ height: "100px" }}></div>
            ))
          ) : (
            filteredCategories.map((cat) => (
              <div 
                key={cat.id} 
                className={`${styles.card} ${expandedId === cat.id ? styles.expanded : ""}`}
                onClick={() => toggleExpand(cat.id)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    {iconMap[cat.icon] || <Briefcase size={24} />}
                  </div>
                  <div className={styles.mainInfo}>
                    <h3 className={styles.catName}>{cat.name}</h3>
                    <span className={styles.jobCount}>{cat.subcategories?.length || 0} Specialties</span>
                  </div>
                  <ChevronDown size={20} className={styles.chevron} />
                </div>
                
                <div className={styles.dropdown}>
                  <div className={styles.subcategoryList}>
                    {cat.subcategories?.map((sub: any) => (
                      <Link 
                        key={sub.id} 
                        to={`/jobs?subcategory=${sub.id}`}
                        className={styles.subcatItem}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {sub.name}
                        <ArrowRight size={14} />
                      </Link>
                    ))}
                    {(!cat.subcategories || cat.subcategories.length === 0) && (
                      <div className={styles.subcatItem} style={{ fontStyle: 'italic', color: 'var(--color-neutral-400)' }}>
                        No subcategories available.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
