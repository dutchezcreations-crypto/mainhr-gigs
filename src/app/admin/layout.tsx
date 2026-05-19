import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout() {
  const supabase = createClient() as any;
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth/login?redirect=/admin");
        return;
      }
      setUser(user);
    }
    getUser();
  }, [supabase, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-500 font-semibold animate-pulse">Loading admin space...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar user={user} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
