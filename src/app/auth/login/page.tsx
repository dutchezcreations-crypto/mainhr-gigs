"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Chrome, Phone, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../AuthPages.module.css";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams.get("next") || "/dashboard";
  const supabase = createClient();
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push(nextRoute);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextRoute)}`,
      },
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Enter your credentials to access your account</p>
      </div>

      <div className={styles.socialActions}>
        <button 
          className={styles.socialBtn} 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <Chrome size={20} />
          <span>Continue with Google</span>
        </button>
      </div>

      <div className={styles.divider}>
        <span>or continue with</span>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${authMethod === "email" ? styles.tabActive : ""}`}
          onClick={() => setAuthMethod("email")}
        >
          <Mail size={16} /> Email
        </button>
        <button 
          className={`${styles.tab} ${authMethod === "phone" ? styles.tabActive : ""}`}
          onClick={() => setAuthMethod("phone")}
        >
          <Phone size={16} /> Phone
        </button>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          {error}
        </div>
      )}

      <form className={styles.form} onSubmit={handleEmailLogin}>
        {authMethod === "email" ? (
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} size={18} />
              <input 
                name="email"
                type="email" 
                className="input" 
                placeholder="name@company.com" 
                required 
                disabled={loading}
              />
            </div>
          </div>
        ) : (
          <div className="input-group">
            <label className="input-label">Phone Number</label>
            <div className={styles.inputWrapper}>
              <Phone className={styles.inputIcon} size={18} />
              <input 
                name="phone"
                type="tel" 
                className="input" 
                placeholder="+256 700 000000" 
                required 
                disabled={loading}
              />
            </div>
          </div>
        )}

        <div className="input-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="input-label">Password</label>
            <Link href="/auth/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
          </div>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={18} />
            <input 
              name="password"
              type="password" 
              className="input" 
              placeholder="••••••••" 
              required 
              disabled={loading}
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="btn btn-primary btn-lg" 
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className={styles.footer}>
        Don't have an account? <Link href="/auth/signup" className={styles.link}>Create an account</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-12 text-neutral-400">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading credentials check...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
