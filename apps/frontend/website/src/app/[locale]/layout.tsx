import { notFound } from 'next/navigation';
import LayoutContent from '../components/LayoutContent';
import { Metadata } from 'next';

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'fr' }
  ];
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

async function getMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string }> },
  parent: { metadata: Metadata }
): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages(locale);
  
  // Get the appropriate description based on locale
  const description = locale === 'fr' 
    ? messages.home.offerings.headline + " " + messages.home.offerings.subheadline
    : "We don't just talk about AI. We build with it. From idea to agent — fast.";

  const title = 'TsunAImi | Agentic AI, fast prototyping and implementation services';
  const imageUrl = 'https://tsunaimi.ai/assets/images/hero1.jpeg';

  return {
    ...parent.metadata,
    title: {
      default: title,
      template: '%s | TsunAImi'
    },
    description,
    keywords: ['agentic AI', 'AI prototyping', 'AI implementation', 'multi-agent systems', 'AI consulting'],
    authors: [{ name: 'TsunAImi' }],
    robots: 'index, follow',
    alternates: {
      canonical: 'https://tsunaimi.ai',
      languages: {
        'en': 'https://tsunaimi.ai/en',
        'fr': 'https://tsunaimi.ai/fr'
      }
    },
    openGraph: {
      title,
      description,
      url: 'https://tsunaimi.ai',
      siteName: 'TsunAImi',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: 'TsunAImi - Agentic AI Solutions'
        }
      ],
      locale: locale,
      type: 'website',
    }
  };
}

export default async function LocaleLayout(props: LocaleLayoutProps) {
  const { children, params } = props;
  const { locale } = await params;
  const messages = await getMessages(locale);

  return (
    <LayoutContent locale={locale} messages={messages}>
      {children}
    </LayoutContent>
  );
} 