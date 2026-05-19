"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  PlusSquare, 
  MessageSquare, 
  User 
} from "lucide-react";
import styles from "./MobileNav.module.css";

export function MobileNav() {
  const pathname = usePathname();

  // Only show on dashboard and main pages, hide on auth pages
  if (pathname.startsWith('/auth')) return null;

  return (
    <nav className={styles.nav}>
      <Link href="/" className={`${styles.link} ${pathname === '/' ? styles.active : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </Link>
      <Link href="/gigs" className={`${styles.link} ${pathname.startsWith('/gigs') ? styles.active : ''}`}>
        <Search size={24} />
        <span>Gigs</span>
      </Link>
      <Link href="/dashboard/jobs/post" className={styles.plusLink}>
        <div className={styles.plusIcon}>
          <PlusSquare size={28} />
        </div>
      </Link>
      <Link href="/dashboard/messages" className={`${styles.link} ${pathname.startsWith('/dashboard/messages') ? styles.active : ''}`}>
        <MessageSquare size={24} />
        <span>Chat</span>
      </Link>
      <Link href="/dashboard" className={`${styles.link} ${pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/messages') ? styles.active : ''}`}>
        <User size={24} />
        <span>Account</span>
      </Link>
    </nav>
  );
}
