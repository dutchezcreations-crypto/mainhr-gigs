import { useState, useEffect, useRef } from "react";
import { 
  User, 
  Shield, 
  Bell, 
  Lock, 
  Globe, 
  Mail,
  Camera,
  CheckCircle2,
  Loader2,
  Save,
  AlertTriangle,
  LogOut
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./Settings.module.css";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const supabase = createClient() as any;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    headline: "",
    bio: "",
    hourly_rate: "",
    email: ""
  });

  const [securityData, setSecurityData] = useState({
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchProfile();
  }, [supabase]);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Read fast cached avatar from localStorage
    const cachedAvatar = localStorage.getItem(`user_avatar_${user.id}`);

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (data) {
      if (cachedAvatar && !data.avatar_url) {
        data.avatar_url = cachedAvatar;
      }
      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        headline: data.headline || "",
        bio: data.bio || "",
        hourly_rate: data.hourly_rate?.toString() || "",
        email: user.email || ""
      });
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          headline: formData.headline,
          bio: formData.bio,
          hourly_rate: parseFloat(formData.hourly_rate) || null
        })
        .eq("id", user.id);

      if (error) throw error;
      alert("Profile updated successfully!");
      fetchProfile();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2MB limit");
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = "";

      // Try uploading to Supabase Storage first
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.warn("Supabase avatar upload failed, falling back to local base64:", uploadError.message);
          imageUrl = await convertToBase64(file);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          imageUrl = publicUrl;
        }
      } catch (err: any) {
        console.warn("Storage upload exception, falling back to local base64:", err);
        imageUrl = await convertToBase64(file);
      }

      if (imageUrl) {
        // Save to database
        const { error: dbError } = await supabase
          .from("profiles")
          .update({ avatar_url: imageUrl })
          .eq("id", user.id);

        if (dbError) throw dbError;

        // Save to localStorage cache as backup
        localStorage.setItem(`user_avatar_${user.id}`, imageUrl);

        setProfile((prev: any) => ({ ...prev, avatar_url: imageUrl }));

        // Dispatch a custom event to sync headers/navbars dynamically
        window.dispatchEvent(new Event("avatarUpdated"));
      }
    } catch (err: any) {
      alert("Error updating profile photo: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.password !== securityData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: securityData.password });
    if (error) {
      alert(error.message);
    } else {
      alert("Password updated successfully!");
      setSecurityData({ password: "", confirmPassword: "" });
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action is permanent and cannot be undone.")) return;
    alert("In a production environment, this would trigger an account closure request to the admin.");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-primary-600" size={48} />
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account preferences and security settings</p>
      </div>

      <div className={styles.layout}>
        <aside className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === "profile" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={18} /> Profile
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "security" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Shield size={18} /> Security
          </button>
          <button 
            className={`${styles.tab} ${activeTab === "notifications" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={18} /> Notifications
          </button>
        </aside>

        <main className={styles.main}>
          <div className={styles.card}>
            {activeTab === "profile" && (
              <form className={styles.content} onSubmit={handleSaveProfile}>
                <div className={styles.avatarSection}>
                  <div 
                    className={styles.avatar} 
                    style={{ backgroundImage: profile?.avatar_url ? `url(${profile.avatar_url})` : 'none' }}
                  >
                    <div className={styles.avatarOverlay} onClick={() => fileInputRef.current?.click()}>
                      <Camera size={24} />
                    </div>
                    <input type="file" hidden ref={fileInputRef} onChange={handleAvatarUpload} />
                  </div>
                  <div>
                    <h3 className={styles.sectionTitle}>Profile Photo</h3>
                    <p className={styles.sectionDesc}>PNG, JPG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className="input-group">
                    <label className="input-label">Full Name</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={formData.full_name} 
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Headline</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={formData.headline} 
                      onChange={e => setFormData({...formData, headline: e.target.value})}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email Address (Read-only)</label>
                    <input type="email" className="input" value={formData.email} disabled />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Hourly Rate (UGX)</label>
                    <input 
                      type="number" 
                      className="input" 
                      value={formData.hourly_rate} 
                      onChange={e => setFormData({...formData, hourly_rate: e.target.value})}
                    />
                  </div>
                  <div className="input-group" style={{ gridColumn: "span 2" }}>
                    <label className="input-label">Bio</label>
                    <textarea 
                      className="input" 
                      rows={4} 
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                    ></textarea>
                  </div>
                </div>

                <div className={styles.footer}>
                   <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                      Save Changes
                   </button>
                </div>
              </form>
            )}

            {activeTab === "security" && (
              <div className={styles.content}>
                <form onSubmit={handleUpdatePassword}>
                  <h3 className={styles.sectionTitle}>Change Password</h3>
                  <div className={styles.formGrid}>
                    <div className="input-group">
                      <label className="input-label">New Password</label>
                      <input 
                        type="password" 
                        className="input" 
                        placeholder="••••••••" 
                        required
                        value={securityData.password}
                        onChange={e => setSecurityData({...securityData, password: e.target.value})}
                      />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="input" 
                        placeholder="••••••••" 
                        required
                        value={securityData.confirmPassword}
                        onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button type="submit" className="btn btn-primary" disabled={saving}>Update Password</button>
                  </div>
                </form>

                <div className={styles.divider}></div>

                <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                   <h4 className="text-red-900 font-900 flex items-center gap-2 mb-2">
                      <AlertTriangle size={20} /> Danger Zone
                   </h4>
                   <p className="text-sm font-medium text-red-700 mb-6">
                      Deleting your account will remove all your data, projects, and transaction history. This action cannot be undone.
                   </p>
                   <button className="btn btn-error btn-outline" onClick={handleDeleteAccount}>
                      Delete My Account
                   </button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className={styles.content}>
                <h3 className={styles.sectionTitle}>Notification Preferences</h3>
                <p className={styles.sectionDesc}>Choose how you want to be notified about platform activity.</p>
                
                <div className="mt-8 space-y-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <div className="font-850 text-neutral-900">Email Notifications</div>
                        <div className="text-xs font-medium text-neutral-400">Receive emails for hires, payments, and messages.</div>
                     </div>
                     <div className="w-12 h-6 bg-primary-600 rounded-full flex items-center px-1">
                        <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                     </div>
                  </div>
                  <div className="flex items-center justify-between">
                     <div>
                        <div className="font-850 text-neutral-900">Push Notifications</div>
                        <div className="text-xs font-medium text-neutral-400">Real-time alerts in your browser.</div>
                     </div>
                     <div className="w-12 h-6 bg-neutral-200 rounded-full flex items-center px-1">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
