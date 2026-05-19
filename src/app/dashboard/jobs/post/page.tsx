"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  Info, 
  ChevronRight, 
  Briefcase, 
  DollarSign, 
  Clock, 
  MapPin,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./PostJob.module.css";

export default function PostJobPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [subcategories, setSubcategories] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    subcategory_id: "",
    description: "",
    requirements: "",
    job_type: "full-time",
    budget_type: "fixed",
    budget_max: "",
    experience_level: "intermediate",
    duration: "Less than 1 month",
    location_type: "remote",
    location: "Remote",
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
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "category_id") {
        updated.subcategory_id = "";
      }
      if (name === "location_type") {
        updated.location = value === "remote" ? "Remote" : "";
      }
      return updated;
    });
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handlePostJob = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push("/auth/login?next=/dashboard/jobs/post");
      return;
    }

    // Get posting user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = profile?.role === "admin";
    const adminStatus = isAdmin ? "approved" : "pending";

    // Parse requirements into skills array
    const skillsArray = formData.requirements
      ? formData.requirements
          .split("\n")
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : [];

    const { error } = await supabase.from("jobs").insert({
      employer_id: user.id,
      title: formData.title,
      category_id: formData.category_id || null,
      subcategory_id: formData.subcategory_id || null,
      description: formData.description,
      requirements: formData.requirements || null,
      skills_required: skillsArray,
      job_type: formData.job_type,
      budget_type: formData.budget_type,
      budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
      experience_level: formData.experience_level,
      duration: formData.duration,
      location_type: formData.location_type,
      location: formData.location,
      status: "open",
      admin_status: adminStatus
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard/jobs");
      router.refresh();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className={styles.title}>Post a New Job</h1>
        <p className={styles.subtitle}>Find the perfect freelancer for your next project</p>
      </div>

      <div className={styles.stepper}>
        {[1, 2, 3].map((s) => (
          <div key={s} className={`${styles.step} ${step >= s ? styles.stepActive : ""}`}>
            <div className={styles.stepNum}>{step > s ? <CheckCircle2 size={16} /> : s}</div>
            <span className={styles.stepLabel}>
              {s === 1 ? "Basics" : s === 2 ? "Budget" : "Review"}
            </span>
            {s < 3 && <div className={styles.stepLine}></div>}
          </div>
        ))}
      </div>

      <div className={styles.card}>
        {step === 1 && (
          <div className={styles.formStep}>
            <div className="input-group">
              <label className="input-label">Job Title</label>
              <input 
                name="title"
                type="text" 
                className="input" 
                placeholder="e.g. Senior UI/UX Designer for Fintech App" 
                value={formData.title}
                onChange={handleChange}
                required
              />
              <p className={styles.inputHint}>A clear title helps attract the right talent</p>
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
              <label className="input-label">Job Type</label>
              <select 
                name="job_type"
                className="input" 
                value={formData.job_type}
                onChange={handleChange}
                required
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Job Description</label>
              <textarea 
                name="description"
                className="input" 
                rows={6} 
                placeholder="Describe the responsibilities, requirements, and deliverables..."
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="input-group">
              <label className="input-label">Key Requirements (Optional)</label>
              <textarea 
                name="requirements"
                className="input" 
                rows={4} 
                placeholder="List skills, qualifications, or key requirements (one per line)..."
                value={formData.requirements}
                onChange={handleChange}
              ></textarea>
              <p className={styles.inputHint}>List each skill or requirement on a new line to display as bullet points.</p>
            </div>

            <div className={styles.footer}>
              <button 
                className="btn btn-primary btn-lg" 
                onClick={nextStep}
                disabled={!formData.title || !formData.description || !formData.subcategory_id}
              >
                Next: Budget & Location <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.formStep}>
            <div className={styles.grid}>
              <div className="input-group">
                <label className="input-label">Budget Type</label>
                <div className={styles.radioGroup}>
                  <button 
                    type="button"
                    className={`${styles.radioBtn} ${formData.budget_type === "fixed" ? styles.radioActive : ""}`}
                    onClick={() => setFormData({...formData, budget_type: "fixed"})}
                  >
                    Fixed Price
                  </button>
                  <button 
                    type="button"
                    className={`${styles.radioBtn} ${formData.budget_type === "hourly" ? styles.radioActive : ""}`}
                    onClick={() => setFormData({...formData, budget_type: "hourly"})}
                  >
                    Hourly Rate
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Max Budget (UGX)</label>
                <div className={styles.priceInput}>
                  <DollarSign size={18} className={styles.priceIcon} />
                  <input 
                    name="budget_max"
                    type="number" 
                    className="input" 
                    placeholder="0.00" 
                    value={formData.budget_max}
                    onChange={handleChange}
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              <div className="input-group">
                <label className="input-label">Location Type</label>
                <select 
                  name="location_type"
                  className="input"
                  value={formData.location_type}
                  onChange={handleChange}
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Location</label>
                <div className={styles.priceInput}>
                  <MapPin size={18} className={styles.priceIcon} />
                  <input 
                    name="location"
                    type="text" 
                    className="input" 
                    placeholder="e.g. Kampala, Uganda or Remote" 
                    value={formData.location}
                    onChange={handleChange}
                    required={formData.location_type !== "remote"}
                  />
                </div>
              </div>
            </div>

            <div className={styles.grid}>
              <div className="input-group">
                <label className="input-label">Experience Level</label>
                <select 
                  name="experience_level"
                  className="input"
                  value={formData.experience_level}
                  onChange={handleChange}
                >
                  <option value="entry">Entry Level</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Duration</label>
                <select 
                  name="duration"
                  className="input"
                  value={formData.duration}
                  onChange={handleChange}
                >
                  <option>Less than 1 month</option>
                  <option>1-3 months</option>
                  <option>3-6 months</option>
                  <option>More than 6 months</option>
                </select>
              </div>
            </div>

            <div className={styles.footer}>
              <button className="btn btn-ghost btn-lg" onClick={prevStep}>Back</button>
              <button 
                className="btn btn-primary btn-lg" 
                onClick={nextStep}
                disabled={!formData.budget_max || parseFloat(formData.budget_max) <= 0}
              >
                Next: Review & Post <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.formStep}>
            <div className={styles.reviewBox}>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Title</span>
                <p className={styles.reviewVal}>{formData.title}</p>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Category & Type</span>
                <p className={styles.reviewVal}>
                  {categories.find(c => c.id === formData.category_id)?.name} • {subcategories.find(s => s.id === formData.subcategory_id)?.name} • {formData.job_type}
                </p>
              </div>
              <div className={styles.reviewItem}>
                <span className={styles.reviewLabel}>Budget & Location</span>
                <p className={styles.reviewVal}>UGX {parseFloat(formData.budget_max).toLocaleString()} ({formData.budget_type}) • {formData.location_type.toUpperCase()} ({formData.location})</p>
              </div>
              {formData.requirements && (
                <div className={styles.reviewItem}>
                  <span className={styles.reviewLabel}>Key Requirements</span>
                  <ul className="list-disc pl-5 mt-1 text-sm text-neutral-600 flex flex-col gap-1">
                    {formData.requirements.split("\n").map((req, idx) => {
                      const trimmed = req.trim();
                      if (!trimmed) return null;
                      return <li key={idx} className={styles.reviewVal} style={{ fontWeight: 400, fontSize: "0.9rem" }}>{trimmed}</li>;
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div className={styles.infoBox}>
              <Info size={20} />
              <p>Your job post will be reviewed by our team within 2 hours to ensure quality and compliance with our professional standards.</p>
            </div>

            <div className={styles.footer}>
              <button className="btn btn-ghost btn-lg" onClick={prevStep} disabled={loading}>Back</button>
              <button 
                className="btn btn-primary btn-lg" 
                onClick={handlePostJob}
                disabled={loading}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Post Job Now <Plus size={18} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
