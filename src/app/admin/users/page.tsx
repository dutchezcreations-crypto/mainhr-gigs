"use client";

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Loader2,
  Mail,
  User as UserIcon
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../Admin.module.css";

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [supabase]);

  const fetchUsers = async () => {
    setLoading(true);
    let q = supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (query) {
      q = q.or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);
    }

    const { data } = await q;
    if (data) setUsers(data);
    setLoading(false);
  };

  const toggleVerification = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: !currentStatus })
      .eq("id", id);
    
    if (!error) {
      setUsers(users.map(u => u.id === id ? { ...u, is_verified: !currentStatus } : u));
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>User Management</h1>
      </header>

      <div className="mb-8 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 outline-none focus:ring-2 focus:ring-primary-500 font-medium"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
          />
        </div>
      </div>

      <div className={styles.tableCard}>
        {loading ? (
          <div className={styles.empty}>
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : users.length === 0 ? (
          <div className={styles.empty}>
            No users found.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                        {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <UserIcon size={20} className="text-neutral-400" />}
                      </div>
                      <div>
                        <div className={styles.jobTitle}>{user.full_name}</div>
                        <div className={styles.jobMeta}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-primary uppercase text-[10px]">{user.role}</span>
                  </td>
                  <td>
                    <div className="font-800 text-neutral-900">UGX {user.balance?.toLocaleString() || 0}</div>
                  </td>
                  <td>
                    {user.is_verified ? (
                      <span className="flex items-center gap-1 text-success-600 font-bold text-xs uppercase">
                        <ShieldCheck size={14} /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-neutral-400 font-bold text-xs uppercase">
                        <ShieldAlert size={14} /> Unverified
                      </span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={`${styles.actionBtn} ${user.is_verified ? styles.rejectBtn : styles.approveBtn}`}
                        title={user.is_verified ? "Remove Verification" : "Verify User"}
                        onClick={() => toggleVerification(user.id, user.is_verified)}
                      >
                        {user.is_verified ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                      </button>
                      <button className={styles.actionBtn}>
                        <Mail size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
