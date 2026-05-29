import type { Metadata } from 'next';
import { getTranslations, getLocale } from 'next-intl/server';
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ContactForm } from "@/components/features/contact-form"
import { buildAlternates, buildOgImage } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Contact.metadata');
  const locale = await getLocale();
  const { canonical, languages } = buildAlternates('/contact', locale);

  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical, languages },
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      images: buildOgImage(),
    },
    twitter: {
      card: 'summary_large_image',
      images: buildOgImage().map(i => i.url),
    },
  };
}

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />

      <div className="fixed inset-0 bg-gradient-to-b from-amber-900 via-amber-800 to-lime-800 -z-10" />

      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-lime-400/20 rounded-full blur-xl" />
        <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-xl" />
      </div>

      <main className="flex-grow pt-16">
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
