import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Loader2,
  FolderPlus,
  Tag,
  X
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "../Admin.module.css";

export default function AdminCategoriesPage() {
  const supabase = createClient() as any;
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"category" | "subcategory">("category");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", parentId: "" });

  useEffect(() => {
    fetchCategories();
  }, [supabase]);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*, subcategories(*)")
      .order("name");
    
    if (data) setCategories(data);
    setLoading(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedCats(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (modalType === "category") {
        if (editingItem) {
          await supabase.from("categories").update({ name: formData.name }).eq("id", editingItem.id);
        } else {
          await supabase.from("categories").insert({ name: formData.name });
        }
      } else {
        if (editingItem) {
          await supabase.from("subcategories").update({ name: formData.name }).eq("id", editingItem.id);
        } else {
          await supabase.from("subcategories").insert({ name: formData.name, category_id: formData.parentId });
        }
      }
      await fetchCategories();
      closeModal();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: "category" | "subcategory") => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
    
    const table = type === "category" ? "categories" : "subcategories";
    const { error } = await supabase.from(table).delete().eq("id", id);
    
    if (error) alert(error.message);
    else fetchCategories();
  };

  const openModal = (type: "category" | "subcategory", item?: any, parentId?: string) => {
    setModalType(type);
    setEditingItem(item || null);
    setFormData({ name: item?.name || "", parentId: parentId || "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ name: "", parentId: "" });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Manage Categories</h1>
        <button className="btn btn-primary" onClick={() => openModal("category")}>
          <FolderPlus size={18} /> Add Category
        </button>
      </header>

      <div className={styles.tableCard}>
        {loading && categories.length === 0 ? (
          <div className={styles.empty}>
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : (
          <div className={styles.catList}>
            {categories.map(cat => (
              <div key={cat.id} className={styles.catItemWrapper}>
                <div className={styles.catItem}>
                  <button className={styles.expandBtn} onClick={() => toggleExpand(cat.id)}>
                    {expandedCats.includes(cat.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>
                  <span className={styles.catName}>{cat.name}</span>
                  <span className={styles.catCount}>{cat.subcategories?.length || 0} specialties</span>
                  <div className={styles.catActions}>
                    <button className={styles.actionBtn} title="Add Specialty" onClick={() => openModal("subcategory", null, cat.id)}>
                      <Plus size={16} />
                    </button>
                    <button className={styles.actionBtn} title="Edit" onClick={() => openModal("category", cat)}>
                      <Edit2 size={16} />
                    </button>
                    <button className={`${styles.actionBtn} ${styles.rejectBtn}`} title="Delete" onClick={() => handleDelete(cat.id, "category")}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {expandedCats.includes(cat.id) && (
                  <div className={styles.subList}>
                    {cat.subcategories?.map((sub: any) => (
                      <div key={sub.id} className={styles.subItem}>
                        <Tag size={14} className={styles.subIcon} />
                        <span className={styles.subName}>{sub.name}</span>
                        <div className={styles.catActions}>
                          <button className={styles.actionBtn} title="Edit" onClick={() => openModal("subcategory", sub)}>
                            <Edit2 size={16} />
                          </button>
                          <button className={`${styles.actionBtn} ${styles.rejectBtn}`} title="Delete" onClick={() => handleDelete(sub.id, "subcategory")}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {cat.subcategories?.length === 0 && (
                      <div className={styles.subEmpty}>No specialties added yet.</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold">{editingItem ? "Edit" : "Add"} {modalType === "category" ? "Category" : "Specialty"}</h2>
              <button onClick={closeModal} className="text-neutral-400 hover:text-neutral-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Name</label>
                <input 
                  type="text" 
                  className="input" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  autoFocus
                  placeholder={modalType === "category" ? "e.g. Information Technology" : "e.g. Frontend Development"}
                />
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
