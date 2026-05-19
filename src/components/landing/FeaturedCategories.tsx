import { Link } from "react-router-dom";
import { 
  Code, 
  Palette, 
  BarChart, 
  PenTool, 
  Users, 
  Scale, 
  HeartPulse, 
  Briefcase,
  ArrowRight
} from "lucide-react";
import styles from "./FeaturedCategories.module.css";

const categories = [
  { name: "Software Development", slug: "software", icon: <Code size={24} />, jobs: "1.2k+" },
  { name: "Design & Creative", slug: "design", icon: <Palette size={24} />, jobs: "850+" },
  { name: "Marketing & Sales", slug: "marketing", icon: <BarChart size={24} />, jobs: "420+" },
  { name: "Writing & Content", slug: "writing", icon: <PenTool size={24} />, jobs: "630+" },
  { name: "Human Resources", slug: "hr", icon: <Users size={24} />, jobs: "210+" },
  { name: "Legal & Compliance", slug: "legal", icon: <Scale size={24} />, jobs: "150+" },
  { name: "Healthcare Tech", slug: "health", icon: <HeartPulse size={24} />, jobs: "90+" },
  { name: "Business Strategy", slug: "business", icon: <Briefcase size={24} />, jobs: "300+" },
];

export function FeaturedCategories() {
  return (
    <section className="section" style={{ background: "var(--color-neutral-50)" }}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <div className="section-label">Browse by Talent</div>
            <h2 className="section-title">Explore <span className="text-gradient">Categories</span></h2>
          </div>
          <Link to="/categories" className="btn btn-outline">
            View All Categories <ArrowRight size={18} />
          </Link>
        </div>

        <div className={styles.grid}>
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/categories/${cat.slug}`} className={styles.card}>
              <div className={styles.iconWrapper}>
                {cat.icon}
              </div>
              <h3 className={styles.catName}>{cat.name}</h3>
              <p className={styles.catJobs}>{cat.jobs} active gigs</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
