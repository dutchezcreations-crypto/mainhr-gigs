import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Chrome, Phone, ArrowRight, User, Building2, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../AuthPages.module.css";

export default function SignupPage() {
  const navigate = useNavigate();
  const supabase = createClient() as any;
  const [role, setRole] = useState<"freelancer" | "employer">("freelancer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Check your email</h1>
          <p className={styles.subtitle}>We've sent a verification link to your email address.</p>
        </div>
        <Link to="/auth/login" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "2rem" }}>
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Get started</h1>
        <p className={styles.subtitle}>Join Uganda's premier freelance marketplace</p>
      </div>

      <div className={styles.roleSelector}>
        <button 
          className={`${styles.roleBtn} ${role === "freelancer" ? styles.roleActive : ""}`}
          onClick={() => setRole("freelancer")}
          disabled={loading}
        >
          <div className={styles.roleIcon}>
            <User size={20} />
          </div>
          <div className={styles.roleContent}>
            <span className={styles.roleTitle}>Freelancer</span>
            <span className={styles.roleDesc}>Find work & grow your career</span>
          </div>
        </button>

        <button 
          className={`${styles.roleBtn} ${role === "employer" ? styles.roleActive : ""}`}
          onClick={() => setRole("employer")}
          disabled={loading}
        >
          <div className={styles.roleIcon}>
            <Building2 size={20} />
          </div>
          <div className={styles.roleContent}>
            <span className={styles.roleTitle}>Employer</span>
            <span className={styles.roleDesc}>Hire talent & scale your business</span>
          </div>
        </button>
      </div>

      <div className={styles.socialActions}>
        <button 
          className={styles.socialBtn} 
          onClick={handleGoogleSignup}
          disabled={loading}
        >
          <Chrome size={20} />
          <span>Sign up with Google</span>
        </button>
      </div>

      <div className={styles.divider}>
        <span>or use email</span>
      </div>

      {error && (
        <div className={styles.errorAlert}>
          {error}
        </div>
      )}

      <form className={styles.form} onSubmit={handleSignup}>
        <div className={styles.formRow}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input 
              name="fullName"
              type="text" 
              className="input" 
              placeholder="John Doe" 
              required 
              disabled={loading}
            />
          </div>
        </div>

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

        <div className="input-group">
          <label className="input-label">Password</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={18} />
            <input 
              name="password"
              type="password" 
              className="input" 
              placeholder="At least 8 characters" 
              required 
              disabled={loading}
            />
          </div>
        </div>

        <p className={styles.terms}>
          By signing up, you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.
        </p>

        <button 
          type="submit" 
          className="btn btn-primary btn-lg" 
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create Account <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className={styles.footer}>
        Already have an account? <Link to="/auth/login" className={styles.link}>Sign in</Link>
      </p>
    </div>
  );
}
