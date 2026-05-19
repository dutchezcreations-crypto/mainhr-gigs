export const marketplaceCategories = [
  {
    id: "software-tech",
    name: "Software & Tech",
    slug: "software",
    description: "Build robust digital solutions with top engineers.",
    subcategories: ["Web Development", "Mobile Apps", "API & Backend", "AI & Data Science"],
    color: "var(--color-primary-600)",
  },
  {
    id: "design-creative",
    name: "Design & Creative",
    slug: "design",
    description: "Visual identities that resonate and convert.",
    subcategories: ["UI/UX Design", "Branding", "Motion Graphics", "Illustration"],
    color: "var(--color-accent-500)",
  },
  {
    id: "hr-recruitment",
    name: "HR & Recruitment",
    slug: "hr",
    description: "Scale your workforce with professional compliance.",
    subcategories: ["Talent Sourcing", "HR Audit", "Payroll Setup", "Compliance"],
    color: "var(--color-success-600)",
  },
  {
    id: "marketing-sales",
    name: "Marketing & Sales",
    slug: "marketing",
    description: "Growth-focused strategies for modern brands.",
    subcategories: ["SEO", "Social Media", "Performance Ads", "Email Marketing"],
    color: "var(--color-warning-500)",
  },
];

export const initialGigsData = [
  {
    id: "gig-1",
    title: "Senior UI/UX Design for Fintech Mobile App",
    description: "Complete design system and mobile UI for financial applications.",
    price: 450000,
    category: "design",
    rating: 4.9,
    reviews: 24,
    delivery_days: 3,
    seller: {
      name: "Sarah Namayanja",
      avatar: "",
      level: "Top Rated",
    }
  },
  {
    id: "gig-2",
    title: "Full HR Compliance Audit & Policy Review",
    description: "Professional audit of your company's HR policies and legal compliance.",
    price: 800000,
    category: "hr",
    rating: 5.0,
    reviews: 12,
    delivery_days: 7,
    seller: {
      name: "David Okello",
      avatar: "",
      level: "Pro",
    }
  }
];
