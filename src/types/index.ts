export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: 'freelancer' | 'employer' | 'admin';
  bio: string | null;
  headline: string | null;
  location: string | null;
  website: string | null;
  hourly_rate: number | null;
  skills: string[];
  is_verified: boolean;
  is_available: boolean;
  credits: number;
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise';
  subscription_expires_at: string | null;
  onboarding_completed: boolean;
  balance: number;
  rating_avg: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  employer_id: string;
  company_id: string | null;
  category_id: string | null;
  subcategory_id: string | null;
  title: string;
  slug: string | null;
  description: string;
  requirements: string | null;
  budget_min: number | null;
  budget_max: number | null;
  budget_type: 'fixed' | 'hourly' | 'monthly';
  currency: string;
  duration: string | null;
  experience_level: 'entry' | 'intermediate' | 'expert' | null;
  location_type: 'remote' | 'onsite' | 'hybrid';
  location: string | null;
  skills_required: string[];
  status: 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'closed';
  visibility: 'public' | 'private' | 'invite_only';
  applications_count: number;
  views_count: number;
  is_featured: boolean;
  expires_at: string | null;
  admin_status: 'pending' | 'approved' | 'rejected';
  job_type: 'full-time' | 'part-time' | 'internship' | 'freelance' | 'contract' | 'remote' | null;
  service_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  freelancer_id: string;
  category_id: string | null;
  subcategory_id: string | null;
  title: string;
  slug: string | null;
  description: string;
  price: number;
  price_type: 'fixed' | 'hourly' | 'starting_at';
  currency: string;
  delivery_time: string | null;
  revisions: number;
  tags: string[];
  images: string[];
  status: 'active' | 'paused' | 'draft';
  rating_avg: number;
  rating_count: number;
  orders_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  freelancer_id: string;
  cover_letter: string | null;
  proposed_rate: number | null;
  proposed_timeline: string | null;
  attachments: string[];
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn' | 'hired';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'payment' | 'payout' | 'credit_purchase' | 'subscription' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface EscrowHolding {
  id: string;
  job_id: string;
  application_id: string;
  employer_id: string;
  freelancer_id: string;
  amount: number;
  status: 'held' | 'released' | 'refunded' | 'disputed';
  created_at: string;
  updated_at: string;
}
