import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Briefcase, 
  Star, 
  Users, 
  Settings, 
  LogOut,
  ShieldCheck,
  Tag
} from "lucide-react";
import styles from "./AdminSidebar.module.css";

const navItems = [
  { label: "Overview", href: "/admin", icon: <LayoutDashboard size={20} /> },
  { label: "Job Moderation", href: "/admin/jobs", icon: <Briefcase size={20} /> },
  { label: "Gig Moderation", href: "/admin/gigs", icon: <Star size={20} /> },
  { label: "User Management", href: "/admin/users", icon: <Users size={20} /> },
  { label: "Categories", href: "/admin/categories", icon: <Tag size={20} /> },
];

export default function AdminSidebar({ user }: { user: any }) {
  const { pathname } = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          MainHR <span className={styles.adminBadge}>Admin</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            to={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ""}`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.avatar}></div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.email?.split('@')[0]}</div>
            <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">System Admin</div>
          </div>
        </div>
        <Link to="/dashboard" className={`${styles.navItem} mt-4`}>
          <LogOut size={18} />
          Exit Admin
        </Link>
      </div>
    </aside>
  );
}
