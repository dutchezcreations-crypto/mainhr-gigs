import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Plus, 
  Info, 
  ChevronRight, 
  DollarSign, 
  CheckCircle2,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./CreateService.module.css";

export default function CreateServicePage() {
  const navigate = useNavigate();
  const supabase = createClient() as any;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [subcategories, setSubcategories] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    subcategory_id: "",
    description: "",
    price_type: "fixed",
    price: "",
    delivery_time: "3 days",
    revisions: "3",
  });

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("id, name").order("name");
      if (data) setCategories(data);
    }
    fetchCategories();
  }, [supabase]);

  useEffect(() => {
    async function fetchSubcategories() {
      if (!formData.category_id) {
        setSubcategories([]);
        return;
      }
      const { data } = await supabase
        .from("subcategories")
        .select("id, name")
        .eq("category_id", formData.category_id)
        .order("name");
      if (data) setSubcategories(data);
    }
    fetchSubcategories();
  }, [formData.category_id, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleCreateService = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth/login?next=/dashboard/services/create");
      return;
    }

    const { error } = await supabase.from("services").insert({
      freelancer_id: user.id,
      title: formData.title,
      category_id: formData.category_id || null,
      subcategory_id: formData.subcategory_id || null,
      description: formData.description,
      price: formData.price ? parseFloat(formData.price) : null,
      price_type: formData.price_type,
      delivery_time: formData.delivery_time,
      revisions: parseInt(formData.revisions) || 0,
      status: "active"
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      navigate("/dashboard/services");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className={styles.title}>Create a Service</h1>
        <p className={styles.subtitle}>Offer your skills to potential clients and start earning</p>
      </div>

      <div className={styles.stepper}>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`${styles.step} ${step >= s ? styles.stepActive : ""}`}>
            <div className={styles.stepNum}>{step > s ? <CheckCircle2 size={16} /> : s}</div>
            <span className={styles.stepLabel}>
              {s === 1 ? "Basics" : s === 2 ? "Pricing" : "Review"}
            </span>
            {s < 3 && <div className={styles.stepLine}></div>}
          </div>
        ))}
      </div>

      <div className={styles.card}>
        {step === 1 && (
          <div className={styles.formStep}>
            <div className="input-group">
              <label className="input-label">Service Title</label>
              <input 
                name="title"
                type="text" 
                className="input" 
                placeholder="e.g. I will design a modern SaaS landing page" 
                value={formData.title}
                onChange={handleChange}
                required
              />
              <p className={styles.inputHint}>Start with "I will..." for better engagement</p>
            </div>

            <div className={styles.grid}>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select 
                  name="category_id"
                  className="input" 
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Subcategory</label>
                <select 
                  name="subcategory_id"
                  className="input" 
                  value={formData.subcategory_id}
                  onChange={handleChange}
                  required
                  disabled={!formData.category_id}
                >
                  <option value="">Select a subcategory</option>
                  {subcategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Description</label>
              <textarea 
                name="description"
                className="input" 
                rows={6} 
                placeholder="Describe what you offer in detail, including your process and what the client will receive..."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className={styles.footer}>
              <button 
                className="btn btn-primary btn-lg" 
                onClick={nextStep}
                disabled={!formData.title || !formData.description || !formData.subcategory_id}
              >
                Next: Pricing & Delivery <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.formStep}>
            <div className={styles.grid}>
              <div className="input-group">
                <label className="input-label">Pricing Model</label>
                <div className={styles.radioGroup}>
                  <button 
                    className={`${styles.radioBtn} ${formData.price_type === "fixed" ? styles.radioActive : ""}`}
                    onClick={() => setFormData({...formData, price_type: "fixed"})}
                  >
                    Fixed Price
                  </button>
                  <button 
                    className={`${styles.radioBtn} ${formData.price_type === "starting_at" ? styles.radioActive : ""}`}
                    onClick={() => setFormData({...formData, price_type: "starting_at"})}
                  >
                    Starting At
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Service Price (UGX)</label>
                <div className={styles.priceInput}>
                   <DollarSign size={18} className={styles.priceIcon} />
                   <input 
                    name="price"
                    type="number" 
                    className="input" 
                    placeholder="0.00" 
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              <div className="input-group">
                <label className="input-label">Delivery Time</label>
                <select 
                  name="delivery_time"
                  className="input"
                  value={formData.delivery_time}
                  onChange={handleChange}
                >
                  <option>1 day</option>
                  <option>3 days</option>
                  <option>7 days</option>
                  <option>14 days</option>
                  <option>30 days</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Revisions</label>
                <select 
                  name="revisions"
                  className="input"
                  value={formData.revisions}
                  onChange={handleChange}
                >
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>5</option>
                  <option>Unlimited</option>
                </select>
              </div>
            </div>

            <div className={styles.footer}>
              <button className="btn btn-ghost btn-lg" onClick={prevStep}>Back</button>
              <button 
                className="btn btn-primary btn-lg" 
                onClick={nextStep}
                disabled={!formData.price}
              >
                Next: Review & Publish <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.formStep}>
            <div className={styles.reviewBox}>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Service Title</span>
                <p className={styles.reviewVal}>{formData.title}</p>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Category</span>
                <p className={styles.reviewVal}>
                  {categories.find(c => c.id === formData.category_id)?.name} • {subcategories.find(s => s.id === formData.subcategory_id)?.name}
                </p>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Price</span>
                <p className={styles.reviewVal}>UGX {parseFloat(formData.price).toLocaleString()} ({formData.price_type})</p>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Delivery & Revisions</span>
                <p className={styles.reviewVal}>{formData.delivery_time} • {formData.revisions} revisions</p>
              </div>
            </div>

            <div className={styles.infoBox}>
              <Info size={20} />
              <p>Your service will be visible to all potential clients immediately after publishing. Make sure your portfolio is up to date to increase your chances of being hired.</p>
            </div>

            <div className={styles.footer}>
              <button className="btn btn-ghost btn-lg" onClick={prevStep} disabled={loading}>Back</button>
              <button 
                className="btn btn-primary btn-lg" 
                onClick={handleCreateService}
                disabled={loading}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Publish Service <Plus size={18} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
