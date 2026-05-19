"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  ChevronDown,
  Search,
  Briefcase,
  Users,
  User as UserIcon,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "./Logo";
import styles from "./Navbar.module.css";

const navLinks = [
  {
    label: "Find Talent",
    href: "/freelancers",
    icon: <Users size={16} />,
  },
  {
    label: "Find Work",
    href: "/jobs",
    icon: <Briefcase size={16} />,
  },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

export function Navbar() {
  const supabase = createClient();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch session & profile
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profileData);
      }
    }
    checkUser();

    // Listen to Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(profileData);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    // Listen to Avatar Upload Fallback Updates
    const handleAvatarUpdate = () => {
      if (user) {
        const cachedAvatar = localStorage.getItem(`user_avatar_${user.id}`);
        if (cachedAvatar) {
          setProfile((prev: any) => ({ ...prev, avatar_url: cachedAvatar }));
        }
      }
    };
    window.addEventListener("avatarUpdated", handleAvatarUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("avatarUpdated", handleAvatarUpdate);
    };
  }, [supabase, user?.id]);

  // Click Outside to Close User Dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsUserDropdownOpen(false);
    router.push("/");
  };

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
    >
      <nav className={`container ${styles.nav}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Logo height={32} />
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className={styles.navLink}>
              {link.icon && (
                <span className={styles.navIcon}>{link.icon}</span>
              )}
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className={styles.desktopActions}>
          <button className={styles.searchBtn} aria-label="Search">
            <Search size={18} />
          </button>
          
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                className={styles.userProfileBtn} 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                aria-label="User menu"
              >
                {profile?.avatar_url ? (
                  <div 
                    className={styles.userAvatar} 
                    style={{ backgroundImage: `url(${profile.avatar_url})` }}
                  />
                ) : (
                  <div className={styles.userAvatar}>
                    <UserIcon size={16} />
                  </div>
                )}
                <span className="text-sm font-semibold text-neutral-700 pr-1">
                  {profile?.full_name?.split(" ")[0] || "Account"}
                </span>
                <ChevronDown size={14} className="text-neutral-400" />
              </button>

              {isUserDropdownOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userDropdownHeader}>
                    <div className={styles.userDropdownName}>
                      {profile?.full_name || "User Account"}
                    </div>
                    <div className={styles.userDropdownEmail}>
                      {user.email}
                    </div>
                  </div>
                  <div className={styles.userDropdownDivider}></div>
                  
                  <Link 
                    href="/dashboard" 
                    className={styles.userDropdownLink}
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <LayoutDashboard size={14} className="mr-2 inline" />
                    Quick Visit Dashboard
                  </Link>
                  
                  <Link 
                    href="/dashboard/settings" 
                    className={styles.userDropdownLink}
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <UserIcon size={14} className="mr-2 inline" />
                    Account Settings
                  </Link>
                  
                  <div className={styles.userDropdownDivider}></div>
                  
                  <button onClick={handleSignOut} className={styles.signOutBtn}>
                    <LogOut size={14} className="mr-2 inline" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-ghost btn-sm">
                Log In
              </Link>
              <Link href="/auth/signup" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuInner}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.icon && (
                  <span className={styles.navIcon}>{link.icon}</span>
                )}
                {link.label}
              </Link>
            ))}
            
            <div className={styles.mobileActions}>
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-2">
                    {profile?.avatar_url ? (
                      <div 
                        className={styles.userAvatar} 
                        style={{ backgroundImage: `url(${profile.avatar_url})` }}
                      />
                    ) : (
                      <div className={styles.userAvatar}>
                        <UserIcon size={16} />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-neutral-800">{profile?.full_name || "User Account"}</div>
                      <div className="text-xs text-neutral-500">{user.email}</div>
                    </div>
                  </div>
                  
                  <Link
                    href="/dashboard"
                    className="btn btn-outline"
                    style={{ width: "100%" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Quick Visit Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="btn btn-error"
                    style={{ width: "100%", marginTop: "8px" }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="btn btn-outline"
                    style={{ width: "100%" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="btn btn-primary"
                    style={{ width: "100%" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
