import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// Initialize Supabase client once for the auth context.
// This avoids creating multiple client instances across different components.
const supabase = createClient();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

// Create the context with undefined as the initial value.
// This allows us to throw an error in useAuth if it's used outside a provider.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // isLoading starts as true to prevent premature rendering of protected routes
  // while the initial session and admin status are being fetched.
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    // mounted flag prevents state updates if the component unmounts
    // during an async operation.
    let mounted = true;

    async function initializeAuth() {
      try {
        // Hydrate initial state immediately without waiting for the onAuthStateChange event
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            // If we have a user, fetch their role to determine if they are an admin
            await checkAdminStatus(session.user.id);
          } else {
            // If no user, we are done loading
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          // Graceful fallback if Supabase is unreachable or encounters an error.
          // Sets everything to a safe logged-out state instead of hanging forever.
          setUser(null);
          setSession(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    }

    async function checkAdminStatus(userId: string) {
      try {
        // Query the profiles table to determine if the user has the 'admin' role.
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        if (error) throw error;

        if (mounted) {
          setIsAdmin(data?.role === "admin");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        if (mounted) {
          setIsAdmin(false);
        }
      } finally {
        if (mounted) {
          // Loading is complete once the admin check finishes (whether successful or not)
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    // Subscribe to auth state changes to keep session reactive across tabs and logins/logouts
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // When a new session arrives (e.g. user just logged in), 
          // set loading to true while we fetch their admin status
          setIsLoading(true);
          await checkAdminStatus(currentSession.user.id);
        } else {
          // User logged out
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // Cleanup subscription and prevent state updates on unmount
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Expose a helper to easily sign out from any component using the context
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to consume the auth context easily
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
