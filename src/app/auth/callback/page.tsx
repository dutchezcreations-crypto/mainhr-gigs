import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Completing authentication...");
  const supabase = createClient() as any;

  useEffect(() => {
    async function handleCallback() {
      try {
        // Supabase client automatically handles hash (#access_token=...) and query (?code=...) on init
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        // Get the redirection route from search params or default to dashboard
        const next = searchParams.get("next") || "/dashboard";

        if (session) {
          // If a role was selected during signup, update the user profile
          const role = searchParams.get("role");
          if (role === "employer" || role === "freelancer") {
            await supabase
              .from("profiles")
              .update({ role })
              .eq("id", session.user.id);
          }

          setStatus("Authentication successful! Redirecting...");
          setTimeout(() => navigate(next, { replace: true }), 500);
        } else {
          // If no session is found, wait a tiny bit to see if onAuthStateChange fires
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, currentSession: any) => {
            if (currentSession) {
              subscription.unsubscribe();
              
              // Handle role during late auth state changes
              const role = searchParams.get("role");
              if (role === "employer" || role === "freelancer") {
                await supabase
                  .from("profiles")
                  .update({ role })
                  .eq("id", currentSession.user.id);
              }

              setStatus("Authentication successful! Redirecting...");
              navigate(next, { replace: true });
            }
          });

          // Set a timeout to fallback to login if nothing happens in 4 seconds
          const timer = setTimeout(() => {
            subscription.unsubscribe();
            setStatus("Session could not be established. Redirecting to login...");
            setTimeout(() => navigate("/auth/login", { replace: true }), 1500);
          }, 4000);

          return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
          };
        }
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setStatus(`Authentication error: ${err.message || err}. Redirecting to login...`);
        setTimeout(() => navigate("/auth/login", { replace: true }), 2000);
      }
    }

    handleCallback();
  }, [supabase, navigate, searchParams]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f9fafb",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "20px",
      textAlign: "center"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        maxWidth: "450px",
        width: "100%",
        border: "1px solid #f3f4f6"
      }}>
        {/* Loading Spinner */}
        <div style={{
          width: "48px",
          height: "48px",
          border: "4px solid #f3f4f6",
          borderTop: "4px solid #2563eb",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 24px"
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        <h2 style={{ color: "#111827", fontSize: "20px", marginBottom: "8px", fontWeight: "700" }}>
          Signing you in
        </h2>
        <p style={{ color: "#6b7280", fontSize: "15px", margin: 0 }}>
          {status}
        </p>
      </div>
    </div>
  );
}
