import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { createClient } from "@/lib/supabase/client";

// Pages
import HomePage from "@/app/page";
import FreelancersPage from "@/app/freelancers/page";
import FreelancerDetailPage from "@/app/freelancers/[id]/page";
import PricingPage from "@/app/pricing/page";
import CategoriesPage from "@/app/categories/page";
import GigsPage from "@/app/gigs/page";
import GigDetailPage from "@/app/gigs/[id]/page";
import JobsPage from "@/app/jobs/page";
import JobDetailPage from "@/app/jobs/[id]/page";

import LoginPage from "@/app/auth/login/page";
import SignupPage from "@/app/auth/signup/page";

import DashboardPage from "@/app/dashboard/page";
import ServicesPage from "@/app/dashboard/services/page";
import CreateServicePage from "@/app/dashboard/services/create/page";
import BillingPage from "@/app/dashboard/billing/page";
import ManageJobsPage from "@/app/dashboard/jobs/page";
import ApplicationsPage from "@/app/dashboard/applications/page";
import PortfolioPage from "@/app/dashboard/portfolio/page";
import PostJobPage from "@/app/dashboard/jobs/post/page";
import JobApplicantsPage from "@/app/dashboard/jobs/[id]/applicants/page";
import ManageGigsPage from "@/app/dashboard/gigs/page";
import NewGigPage from "@/app/dashboard/gigs/new/page";
import EditGigPage from "@/app/dashboard/gigs/[id]/edit/page";
import MessagesPage from "@/app/dashboard/messages/page";
import ProjectDetailPage from "@/app/dashboard/projects/[id]/page";
import SettingsPage from "@/app/dashboard/settings/page";

import AdminOverviewPage from "@/app/admin/page";
import AdminCategoriesPage from "@/app/admin/categories/page";
import AdminUsersPage from "@/app/admin/users/page";
import AdminGigsPage from "@/app/admin/gigs/page";
import AdminJobsPage from "@/app/admin/jobs/page";

// Layouts
import RootLayout from "@/app/layout";
import DashboardLayout from "@/app/dashboard/layout";
import AdminLayout from "@/app/admin/layout";
import AuthLayout from "@/app/auth/layout";

// Route Guard to verify user is logged in
function ProtectedRoute() {
  const supabase = createClient() as any;
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }
    checkAuth();
  }, [supabase]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-500 font-semibold animate-pulse">Loading account...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/auth/login?redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
}

// Route Guard to verify user is admin
function AdminRoute() {
  const supabase = createClient() as any;
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }
      const { data: profile } = (await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()) as any;
      
      setIsAdmin(profile?.role === "admin");
    }
    checkAdmin();
  }, [supabase]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <p className="text-neutral-500 font-semibold animate-pulse">Verifying admin permissions...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Site Routes wrapped in RootLayout */}
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/freelancers" element={<FreelancersPage />} />
          <Route path="/freelancers/:id" element={<FreelancerDetailPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/gigs" element={<GigsPage />} />
          <Route path="/gigs/:id" element={<GigDetailPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
        </Route>

        {/* Authentication Routes wrapped in AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/services" element={<ServicesPage />} />
            <Route path="/dashboard/services/create" element={<CreateServicePage />} />
            <Route path="/dashboard/billing" element={<BillingPage />} />
            <Route path="/dashboard/jobs" element={<ManageJobsPage />} />
            <Route path="/dashboard/applications" element={<ApplicationsPage />} />
            <Route path="/dashboard/portfolio" element={<PortfolioPage />} />
            <Route path="/dashboard/jobs/post" element={<PostJobPage />} />
            <Route path="/dashboard/jobs/:id/applicants" element={<JobApplicantsPage />} />
            <Route path="/dashboard/gigs" element={<ManageGigsPage />} />
            <Route path="/dashboard/gigs/new" element={<NewGigPage />} />
            <Route path="/dashboard/gigs/:id/edit" element={<EditGigPage />} />
            <Route path="/dashboard/messages" element={<MessagesPage />} />
            <Route path="/dashboard/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminOverviewPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/gigs" element={<AdminGigsPage />} />
              <Route path="/admin/jobs" element={<AdminJobsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback Redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
