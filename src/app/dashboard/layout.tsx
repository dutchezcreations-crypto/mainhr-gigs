"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  Bell, 
  Settings, 
  LogOut, 
  Search,
  User,
  Menu,
  X,
  CreditCard,
  Zap,
  Star,
  Image as ImageIcon
} from "lucide-react";
import styles from "./DashboardLayout.module.css";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (data) setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  interface SidebarLink {
    label: string;
    href: string;
    icon: React.ReactNode;
    badge?: string | number;
  }

  const sidebarLinks: SidebarLink[] = [
    { label: "Overview", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    ...(profile?.role === 'employer' ? [
      { label: "Manage Jobs", href: "/dashboard/jobs", icon: <Briefcase size={20} /> },
    ] : [
      { label: "My Applications", href: "/dashboard/applications", icon: <Briefcase size={20} /> },
      { label: "My Gigs", href: "/dashboard/gigs", icon: <Star size={20} /> },
      { label: "Portfolio", href: "/dashboard/portfolio", icon: <ImageIcon size={20} /> },
    ]),
    { label: "Messages", href: "/dashboard/messages", icon: <MessageSquare size={20} /> },
    { label: "Billing", href: "/dashboard/billing", icon: <CreditCard size={20} /> },
    { label: "Settings", href: "/dashboard/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className={styles.wrapper}>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <Zap size={20} />
          </div>
          <span>MainHR Gigs</span>
        </Link>
        <button onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Zap size={20} />
            </div>
            <span>MainHR Gigs</span>
          </Link>
          <button className={styles.closeBtn} onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navGroup}>
            {sidebarLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`${styles.navLink} ${pathname === link.href ? styles.navLinkActive : ""}`}
                onClick={() => setIsSidebarOpen(false)}
              >
                {link.icon}
                <span>{link.label}</span>
                {link.badge && <span className={styles.navBadge}>{link.badge}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Search Box below the main nav menus */}
        <div className={styles.sidebarSearch}>
          <div className={styles.sidebarSearchContainer}>
            <Search size={16} className={styles.searchIcon} />
            <input type="text" placeholder="Search gigs, jobs..." />
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {profile?.avatar_url && <img src={profile.avatar_url} alt="" />}
            </div>
            <div className={styles.userInfo}>
              <p className={styles.userName}>{profile?.full_name || 'Loading...'}</p>
              <p className={styles.userRole}>{profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleSignOut}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className="flex-1"></div>
          <div className={styles.topbarActions}>
            <NotificationCenter />
            <div className={styles.divider}></div>
            <Link href="/dashboard/settings" className={styles.profileBtn}>
              <User size={20} />
            </Link>
          </div>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </div>

      {/* Overlay */}
      {isSidebarOpen && <div className={styles.overlay} onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
}
