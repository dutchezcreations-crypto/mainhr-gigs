import { useState, useEffect, Suspense } from "react";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Filter,
  Loader2,
  Calendar,
  Building2,
  Tag
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import styles from "./JobsPage.module.css";
import { Link } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

function JobsContent() {
  const [searchParams] = useSearchParams();
  const supabase = createClient() as any;
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Filters
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState(searchParams.get("subcategory") || "");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);

  useEffect(() => {
    async function fetchInitialData() {
      const { data: catData } = await supabase.from("categories").select("*, subcategories(*)").order("name");
      if (catData) setCategories(catData);
    }
    fetchInitialData();
  }, [supabase]);

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory, selectedSubcategory, selectedJobTypes, selectedExperience, supabase]);

  const fetchJobs = async () => {
    setLoading(true);
    let q = supabase
      .from("jobs")
      .select(`
        *,
        categories(name),
        subcategories(name),
        profiles:employer_id(full_name, avatar_url)
      `)
      .eq("admin_status", "approved")
      .order("created_at", { ascending: false });

    if (selectedCategory) q = q.eq("category_id", selectedCategory);
    if (selectedSubcategory) q = q.eq("subcategory_id", selectedSubcategory);
    if (selectedJobTypes.length > 0) q = q.in("job_type", selectedJobTypes);
    if (selectedExperience.length > 0) q = q.in("experience_level", selectedExperience);
    if (query) q = q.ilike("title", `%${query}%`);

    const { data } = await q;
    if (data) setJobs(data);
    setLoading(false);
  };

  const handleJobTypeToggle = (type: string) => {
    setSelectedJobTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>Find Your Next <span className="text-gradient">Career Move</span></h1>
          
          <div className={styles.searchSection}>
            <div className={styles.searchGrid}>
              <div className={styles.inputWrapper}>
                <Search size={20} className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Job title or keywords..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className={styles.inputWrapper}>
                <MapPin size={20} className={styles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="City or Remote" 
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                />
              </div>
              <div className={styles.inputWrapper}>
                <Briefcase size={20} className={styles.searchIcon} />
                <select 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary btn-lg" onClick={fetchJobs}>Search</button>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div className={styles.mainLayout}>
          <aside className={styles.sidebar}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Job Type</span>
              <div className={styles.checkboxList}>
                {["full-time", "part-time", "internship", "freelance", "contract", "remote"].map(type => (
                  <label key={type} className={styles.checkboxItem}>
                    <input 
                      type="checkbox" 
                      checked={selectedJobTypes.includes(type)}
                      onChange={() => handleJobTypeToggle(type)}
                    />
                    {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('-')}
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Experience Level</span>
              <div className={styles.checkboxList}>
                {["entry", "intermediate", "expert"].map(lvl => (
                  <label key={lvl} className={styles.checkboxItem}>
                    <input 
                      type="checkbox" 
                      checked={selectedExperience.includes(lvl)}
                      onChange={() => setSelectedExperience(prev => prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl])}
                    />
                    {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <main>
            <div className={styles.jobList}>
              {loading ? (
                Array(5).fill(0).map((_, i) => <div key={i} className={styles.loadingSkeleton}></div>)
              ) : jobs.length === 0 ? (
                <div className={styles.empty}>
                   <Briefcase size={48} />
                   <p>No jobs found matching your criteria.</p>
                </div>
              ) : (
                jobs.map(job => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className={styles.jobCard}>
                    <div className={styles.companyLogo}>
                      <Building2 size={24} />
                    </div>
                    <div className={styles.jobContent}>
                      <div className={styles.jobHeader}>
                        <h3 className={styles.jobTitle}>{job.title}</h3>
                        <span className={styles.jobPrice}>UGX {job.budget_max?.toLocaleString()}</span>
                      </div>
                      <div className={styles.jobMeta}>
                        <div className={styles.metaItem}>
                          <Building2 size={14} />
                          <span>{job.profiles?.full_name}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <MapPin size={14} />
                          <span>{job.location}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Clock size={14} />
                          <span>{job.job_type}</span>
                        </div>
                        <div className={styles.metaItem}>
                          <Calendar size={14} />
                          <span>{new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className={styles.jobTags}>
                        <span className={styles.jobTag}>{job.categories?.name}</span>
                        {job.subcategories?.name && <span className={styles.jobTag}>{job.subcategories?.name}</span>}
                        <span className={styles.jobTag}>{job.experience_level}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function PublicJobsPage() {
  return (
    <Suspense fallback={<div className="container p-20 text-center"><Loader2 className="animate-spin inline-block mr-2" /> Loading Jobs...</div>}>
      <JobsContent />
    </Suspense>
  );
}
