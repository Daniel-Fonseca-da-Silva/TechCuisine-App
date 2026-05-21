import { Header } from '@/components/layout/header';
import { HeroSection } from '@/components/features/hero-section';
import { CandidatePainPointsSection } from '@/components/features/candidate-pain-points-section';
import { PainPointsSection } from '@/components/features/pain-points-section';
import { BenefitsSection } from '@/components/features/benefits-section';
import { HowItWorksSection } from '@/components/features/how-it-works-section';
import { CandidateAiToolkitSection } from '@/components/features/candidate-ai-toolkit/candidate-ai-toolkit-section';
import { DemoSection } from '@/components/features/demo-section';
import { ResultsTestimonialsSection } from '@/components/features/results-testimonials-section';
import { FaqSection } from '@/components/features/faq-section';
import { SocialProofSection } from '@/components/features/social-proof-section';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <CandidatePainPointsSection />
      <PainPointsSection />
      <BenefitsSection />
      <HowItWorksSection />
      <CandidateAiToolkitSection />
      <DemoSection />
      <ResultsTestimonialsSection />
      <FaqSection />
      <SocialProofSection />
      <Footer />
    </main>
  );
}
