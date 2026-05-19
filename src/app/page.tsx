import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBar } from "@/components/landing/TrustBar";
import { DualAudience } from "@/components/landing/DualAudience";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FeaturedCategories } from "@/components/landing/FeaturedCategories";
import { StatsSection } from "@/components/landing/StatsSection";
import { Testimonials } from "@/components/landing/Testimonials";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { GigsAndJobs } from "@/components/landing/GigsAndJobs";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <DualAudience />
      <GigsAndJobs />
      <FeaturedCategories />
      <HowItWorks />
      <StatsSection />
      <WhyChooseUs />
      <Testimonials />
    </>
  );
}
