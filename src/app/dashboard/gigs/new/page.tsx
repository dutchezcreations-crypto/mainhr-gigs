"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  Save, 
  Info, 
  DollarSign, 
  Clock, 
  Zap, 
  Image as ImageIcon,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./CreateGig.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateGigPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    description: "",
    price: "",
    delivery_time: "3 days",
    revisions: "2",
    status: "active"
  });

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from("categories").select("*").order("name");
      if (data) setCategories(data);
    }
    fetchData();
  }, [supabase]);

  // Convert file to Base64 helper
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit");
      return;
    }

    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Backup to localStorage for high reliability
    try {
      const base64 = await convertToBase64(file);
      localStorage.setItem("temp_gig_image_base64", base64);
    } catch (err) {
      console.warn("Could not cache image in localStorage:", err);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = "";

      // Try uploading to Supabase storage bucket first
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `${user.id}/${Math.random()}.${fileExt}`;
          
          // Attempt standard upload
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('services')
            .upload(fileName, imageFile, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.warn("Supabase storage upload failed, falling back to local/base64 storage:", uploadError.message);
            // Fallback: Read base64 from state or localStorage
            imageUrl = localStorage.getItem("temp_gig_image_base64") || await convertToBase64(imageFile);
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('services')
              .getPublicUrl(fileName);
            imageUrl = publicUrl;
          }
        } catch (err: any) {
          console.warn("Supabase storage error, falling back to local/base64 storage:", err);
          imageUrl = localStorage.getItem("temp_gig_image_base64") || (imageFile ? await convertToBase64(imageFile) : "");
        }
      } else {
        // Backup restore from localStorage if exists
        imageUrl = localStorage.getItem("temp_gig_image_base64") || "";
      }

      // If both failed, we can use a premium placeholder image
      if (!imageUrl) {
        imageUrl = "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80";
      }

      // Save into the database services table
      const { error } = await supabase.from("services").insert({
        freelancer_id: user.id,
        title: formData.title,
        category_id: formData.category_id,
        description: formData.description,
        price: parseFloat(formData.price),
        delivery_time: formData.delivery_time,
        revisions: parseInt(formData.revisions),
        status: formData.status,
        images: [imageUrl] // Save as images array
      });

      if (error) throw error;

      // Clean up localStorage cached preview
      localStorage.removeItem("temp_gig_image_base64");

      router.push("/dashboard/gigs");
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/dashboard/gigs" className="flex items-center text-neutral-500 font-bold mb-4 hover:text-primary-600 transition-colors">
          <ChevronLeft size={18} /> Back to My Gigs
        </Link>
        <h1 className={styles.title}>Create a New Service</h1>
        <p className={styles.subtitle}>Define what you're selling and reach thousands of potential clients.</p>
      </header>

      <form onSubmit={handleSubmit}>
        <div className={styles.formCard}>
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Info size={20} className="text-primary-600" /> Basic Information</h2>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Gig Title</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="I will design a modern logo for your brand"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              <p className="text-xs text-neutral-400 mt-2 font-medium">Capture attention with a clear, descriptive title.</p>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Category</label>
              <select 
                className={styles.select} 
                required
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
              >
                <option value="">Select a Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><Zap size={20} className="text-primary-600" /> Service Details</h2>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Description</label>
              <textarea 
                className={styles.textarea} 
                placeholder="Describe your service in detail. What's included? What's your process?"
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Price (UGX)</label>
                <div className={styles.priceInput}>
                  <span className={styles.currency}>UGX</span>
                  <input 
                    type="number" 
                    className={styles.input} 
                    placeholder="0.00" 
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Delivery Time</label>
                <select 
                  className={styles.select}
                  value={formData.delivery_time}
                  onChange={(e) => setFormData({...formData, delivery_time: e.target.value})}
                >
                  <option value="1 day">1 Day</option>
                  <option value="2 days">2 Days</option>
                  <option value="3 days">3 Days</option>
                  <option value="5 days">5 Days</option>
                  <option value="7 days">7 Days</option>
                  <option value="14 days">14 Days</option>
                </select>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}><ImageIcon size={20} className="text-primary-600" /> Gig Image</h2>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              accept="image/jpeg,image/png,image/webp" 
              onChange={handleImageChange}
            />
            <div className={styles.uploadArea} onClick={handleUploadClick}>
              {imagePreview ? (
                <div className={styles.previewContainer}>
                  <img src={imagePreview} className={styles.previewImage} alt="Gig Preview" />
                  <div className={styles.previewOverlay}>
                    <ImageIcon size={32} />
                    <span className="font-bold text-sm mt-2">Change Image</span>
                  </div>
                </div>
              ) : (
                <>
                  <ImageIcon size={48} className="mx-auto mb-4 opacity-50 text-neutral-400" />
                  <p className="font-bold text-neutral-600">Drag & drop or click to upload</p>
                  <p className="text-xs font-medium text-neutral-400 mt-1">Support: JPG, PNG, WEBP (Max 5MB)</p>
                </>
              )}
            </div>
          </section>
        </div>

        <div className={styles.footer}>
          <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
            Publish Service
          </button>
        </div>
      </form>
    </div>
  );
}
