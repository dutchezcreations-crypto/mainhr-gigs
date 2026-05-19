import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { 
  Home, 
  Search, 
  PlusSquare, 
  MessageSquare, 
  User 
} from "lucide-react";
import styles from "./MobileNav.module.css";

export function MobileNav() {
  const { pathname } = useLocation();

  // Only show on dashboard and main pages, hide on auth pages
  if (pathname.startsWith('/auth')) return null;

  return (
    <nav className={styles.nav}>
      <Link to="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </Link>
      <Link to="/gigs" className={`${styles.link} ${pathname.startsWith('/gigs') ? styles.active : ''}`}>
        <Search size={24} />
        <span>Gigs</span>
      </Link>
      <Link to="/dashboard/jobs/post" className={styles.plusLink}>
        <div className={styles.plusIcon}>
          <PlusSquare size={28} />
        </div>
      </Link>
      <Link to="/dashboard/messages" className={`${styles.link} ${pathname.startsWith('/dashboard/messages') ? styles.active : ''}`}>
        <MessageSquare size={24} />
        <span>Chat</span>
      </Link>
      <Link to="/dashboard" className={`${styles.link} ${pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/messages') ? styles.active : ''}`}>
        <User size={24} />
        <span>Account</span>
      </Link>
    </nav>
  );
}
