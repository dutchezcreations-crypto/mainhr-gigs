"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, Check, ExternalLink, Briefcase, MessageSquare, DollarSign, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import styles from "./NotificationCenter.module.css";

export default function NotificationCenter() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    
    if (data) setNotifications(data);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_application': return <Briefcase size={16} className="text-blue-500" />;
      case 'hired': return <Check size={16} className="text-emerald-500" />;
      case 'payment_received': return <DollarSign size={16} className="text-amber-500" />;
      case 'new_message': return <MessageSquare size={16} className="text-primary-500" />;
      default: return <Bell size={16} className="text-neutral-400" />;
    }
  };

  return (
    <div className={styles.wrapper} ref={dropdownRef}>
      <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
        <Bell size={20} />
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Notifications</h3>
            {unreadCount > 0 && <button className={styles.markAll}>Mark all as read</button>}
          </div>

          <div className={styles.list}>
            {loading ? (
              <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-neutral-300" /></div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>No notifications yet</div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`${styles.item} ${!notif.is_read ? styles.unread : ""}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className={styles.itemIcon}>{getIcon(notif.type)}</div>
                  <div className={styles.itemContent}>
                    <p className={styles.itemTitle}>{notif.title}</p>
                    <p className={styles.itemMessage}>{notif.message}</p>
                    <span className={styles.itemTime}>{new Date(notif.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.footer}>
            <Link href="/dashboard/settings/notifications">View all settings</Link>
          </div>
        </div>
      )}
    </div>
  );
}
