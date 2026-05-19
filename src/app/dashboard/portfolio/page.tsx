import { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  ExternalLink, 
  Loader2,
  X,
  Save
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./Portfolio.module.css";

export default function PortfolioPage() {
  const supabase = createClient() as any;
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    external_link: "",
    image: null as File | null
  });

  useEffect(() => {
    fetchPortfolio();
  }, [supabase]);

  const fetchPortfolio = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("portfolios")
      .select("*")
      .eq("freelancer_id", user.id)
      .order("created_at", { ascending: false });
    
    if (data) setPortfolio(data);
    setLoading(false);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = "";
      if (formData.image) {
        try {
          const fileExt = formData.image.name.split('.').pop();
          const fileName = `${user.id}/${Math.random()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('portfolios')
            .upload(fileName, formData.image);

          if (uploadError) {
            console.warn("Supabase portfolio upload failed, using local base64 fallback:", uploadError.message);
            imageUrl = await convertToBase64(formData.image);
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('portfolios')
              .getPublicUrl(fileName);
            imageUrl = publicUrl;
          }
        } catch (err: any) {
          console.warn("Storage portfolios bucket error, using local base64 fallback:", err);
          imageUrl = await convertToBase64(formData.image);
        }
      }

      const { error } = await supabase.from("portfolios").insert({
        freelancer_id: user.id,
        title: formData.title,
        description: formData.description,
        external_link: formData.external_link,
        image_url: imageUrl
      });

      if (error) throw error;

      setIsModalOpen(false);
      setFormData({ title: "", description: "", external_link: "", image: null });
      fetchPortfolio();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    const { error } = await supabase.from("portfolios").delete().eq("id", id);
    if (!error) {
      setPortfolio(portfolio.filter(p => p.id !== id));
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>My Portfolio</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} className="mr-2" /> Add Project
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary-600" size={40} />
        </div>
      ) : portfolio.length === 0 ? (
        <div className={styles.emptyState}>
          <ImageIcon size={64} className="mx-auto text-neutral-200 mb-6" />
          <h2 className="text-xl font-850 text-neutral-900 mb-2">Showcase Your Work</h2>
          <p className="text-neutral-500 font-medium mb-8">Add projects to your portfolio to impress potential clients and increase your chances of being hired.</p>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Create Your First Project</button>
        </div>
      ) : (
        <div className={styles.grid}>
          {portfolio.map((item) => (
            <div key={item.id} className={styles.portfolioCard}>
              <div className={styles.imageArea}>
                {item.image_url ? <img src={item.image_url} alt="" /> : <ImageIcon size={48} />}
                <div className={styles.cardActions}>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                <p className={styles.itemDesc}>{item.description}</p>
                {item.external_link && (
                  <a href={item.external_link} target="_blank" className="text-primary-600 font-800 text-xs flex items-center gap-1 mt-4 hover:underline">
                    View Live <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-850">Add Portfolio Project</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>

            <form onSubmit={handleAddProject}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Project Title</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  required 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Project Description</label>
                <textarea 
                  className={styles.textarea} 
                  rows={3} 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Project Image</label>
                <div className={styles.uploadTrigger} onClick={() => fileInputRef.current?.click()}>
                  {formData.image ? (
                    <div className="text-emerald-600 font-bold">{formData.image.name}</div>
                  ) : (
                    <>
                      <ImageIcon size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-xs font-bold text-neutral-400">Click to upload work sample</p>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  hidden 
                  ref={fileInputRef} 
                  onChange={e => setFormData({...formData, image: e.target.files?.[0] || null})}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Live Link (Optional)</label>
                <input 
                  type="url" 
                  className={styles.input} 
                  placeholder="https://..." 
                  value={formData.external_link}
                  onChange={e => setFormData({...formData, external_link: e.target.value})}
                />
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
